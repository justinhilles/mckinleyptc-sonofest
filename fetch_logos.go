package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type Sponsor struct {
	Name      string   `json:"name"`
	Href      string   `json:"href"`
	Instagram string   `json:"instagram"`
	Logo      string   `json:"logo"`
	Active    bool     `json:"active"`
	Category  []string `json:"category"`
	Type      string   `json:"type"`
}

// Enrichment flags / config
type EnrichConfig struct {
	Enable     bool
	Provider   string // serpapi | openai | hybrid
	SerpAPIKey string
	OpenAIKey  string
}

var debug bool

func dbg(format string, args ...interface{}) {
	if !debug {
		return
	}
	ts := time.Now().Format("15:04:05.000")
	fmt.Printf("[DBG %s] "+format+"\n", append([]interface{}{ts}, args...)...)
}

// truncBytes truncates a byte slice to max length for debug output.
func truncBytes(b []byte, max int) string {
	if max <= 0 {
		return ""
	}
	if len(b) <= max {
		return string(b)
	}
	return string(b[:max]) + "... (truncated)"
}

// dbgDumpReq dumps HTTP request method, URL, and headers in debug mode.
func dbgDumpReq(req *http.Request) {
	if !debug || req == nil {
		return
	}
	var b strings.Builder
	fmt.Fprintf(&b, "Request %s %s\n", req.Method, req.URL.String())
	// Print headers (mask Authorization)
	for k, vals := range req.Header {
		v := strings.Join(vals, "; ")
		if strings.EqualFold(k, "Authorization") {
			v = "****"
		}
		fmt.Fprintf(&b, "  %s: %s\n", k, v)
	}
	dbg("%s", b.String())
}

func main() {
	// Flags
	envFile := flag.String("env-file", ".env", "Path to .env file to load (optional)")
	siteJSONPath := flag.String("site", "app/content/site.json", "Path to site.json")
	publicDir := flag.String("public", "public", "Public directory (where images/ lives)")
	onlyActive := flag.Bool("only-active", false, "Process only active sponsors")
	cats := flag.String("categories", "", "Comma-separated category filter (e.g. sponsor,chili)")
	dryRun := flag.Bool("dry-run", false, "Run without downloading or writing changes")
	enrich := flag.Bool("enrich-missing", false, "Discover missing sponsor href/instagram via search")
	searchProvider := flag.String("search-provider", "hybrid", "Search provider: serpapi|openai|hybrid")
	serpAPIKey := flag.String("serpapi-key", "", "SerpAPI key (or SERPAPI_KEY env / .env)")
	openAIKey := flag.String("openai-key", "", "OpenAI API key (or OPENAI_API_KEY env / .env)")
	debugFlag := flag.Bool("debug", false, "Verbose debug logging")
	flag.Parse()

	debug = *debugFlag
	if debug {
		fmt.Println("   • DEBUG MODE ON")
	}

	// Load .env first (if present), then backfill empty key flags from env
	if err := loadDotEnv(*envFile); err == nil {
		fmt.Printf("   • Loaded env: %s\n", *envFile)
	}
	if *serpAPIKey == "" {
		if v := os.Getenv("SERPAPI_KEY"); v != "" {
			*serpAPIKey = v
		}
	}
	if *openAIKey == "" {
		if v := os.Getenv("OPENAI_API_KEY"); v != "" {
			*openAIKey = v
		}
	}

	logoDir := filepath.Join(*publicDir, "images", "logos")
	if err := os.MkdirAll(logoDir, 0o755); err != nil {
		fatal("creating logo dir", err)
	}

	root, sponsors, raw, err := readSite(*siteJSONPath)
	if err != nil {
		fatal("reading site.json", err)
	}

	var catFilter map[string]bool
	if strings.TrimSpace(*cats) != "" {
		catFilter = make(map[string]bool)
		for _, c := range strings.Split(*cats, ",") {
			c = strings.TrimSpace(c)
			if c != "" {
				catFilter[strings.ToLower(c)] = true
			}
		}
	}

	client := &http.Client{Timeout: 30 * time.Second}
	ua := "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36"

	econf := EnrichConfig{
		Enable:     *enrich,
		Provider:   strings.ToLower(strings.TrimSpace(*searchProvider)),
		SerpAPIKey: strings.TrimSpace(*serpAPIKey),
		OpenAIKey:  strings.TrimSpace(*openAIKey),
	}

	// fmt.Println(econf.OpenAIKey)

	if econf.Enable {
		fmt.Printf("   • Enrichment: provider=%s\n", econf.Provider)
	}

	fmt.Printf("🔎 Scanning %d sponsors in %s\n", len(sponsors), *siteJSONPath)
	if *onlyActive {
		fmt.Println("   • Filter: only active")
	}
	if len(catFilter) > 0 {
		fmt.Printf("   • Filter: categories in %v\n", keys(catFilter))
	}
	if *dryRun {
		fmt.Println("   • DRY RUN (no downloads / no file writes)")
	}
	fmt.Println()

	success, skipped, fail := 0, 0, 0
	updatedJSON := false

	for i := range sponsors {
		s := sponsors[i]

		sponsorStart := time.Now()
		dbg("sponsor=%q href=%q logo=%q active=%v cats=%v", s.Name, s.Href, s.Logo, s.Active, s.Category)

		// Filters
		if *onlyActive && !s.Active {
			continue
		}
		if len(catFilter) > 0 && !overlapsLower(s.Category, catFilter) {
			continue
		}

		// Enrich website automatically when missing/bad; Instagram always set if missing and discovered
		needHref := strings.TrimSpace(s.Href) == ""
		needIG := strings.TrimSpace(s.Instagram) == ""
		shouldEnrich := needHref || needIG
		if shouldEnrich {
			// Use the configured provider for website lookup even if --enrich-missing is off
			eff := econf
			tEnrich := time.Now()
			fmt.Printf("enrich start: provider=%s needHref=%v needIG=%v\n", eff.Provider, needHref, needIG)
			foundHref, foundIG, err := enrichSponsor(client, ua, &s, eff)
			fmt.Printf("enrich done in %s → href=%q ig=%q err=%v\n", time.Since(tEnrich), foundHref, foundIG, err)
			if err != nil {
				fmt.Printf("   (enrich warn) %s: %v\n", s.Name, err)
			}
			changed := false
			if needHref && strings.TrimSpace(foundHref) != "" {
				sponsors[i].Href = foundHref
				changed = true
				fmt.Printf("   🔗 set href → %s\n", foundHref)
			}
			// Always set Instagram if it's missing and we discovered one (store handle)
			if needIG && strings.TrimSpace(foundIG) != "" {
				sponsors[i].Instagram = igHandle(foundIG)
				changed = true
				fmt.Printf("   📸 set instagram → @%s\n", sponsors[i].Instagram)
			}
			if changed {
				updatedJSON = true
			}
		}

		// Determine intended local path
		localPath := desiredLocalLogoPath(*publicDir, logoDir, s)

		// If logo path exists & file present → skip
		if strings.TrimSpace(s.Logo) != "" && fileExists(localPath) {
			fmt.Printf("✅ %-30s logo OK → %s\n", s.Name, rel(localPath))
			skipped++
			dbg("sponsor=%q done in %s", s.Name, time.Since(sponsorStart))
			continue
		}

		if strings.TrimSpace(s.Href) == "" {
			fmt.Printf("⚠️  %-30s no href to discover logo; logo path set=%t\n", s.Name, strings.TrimSpace(s.Logo) != "")
			fail++
			dbg("sponsor=%q done in %s", s.Name, time.Since(sponsorStart))
			continue
		}

		fmt.Printf("→ %-30s discovering logo from %s\n", s.Name, s.Href)
		if *dryRun {
			fmt.Println("   (dry-run) skipping discovery/download")
			dbg("sponsor=%q done in %s", s.Name, time.Since(sponsorStart))
			continue
		}

		imgURL, ext, err := discoverLogoURL(client, ua, s.Href)
		if err != nil {
			fmt.Printf("   ✖ discovery failed: %v\n", err)
			fail++
			dbg("sponsor=%q done in %s", s.Name, time.Since(sponsorStart))
			continue
		}

		// Choose final target path
		var target string
		if strings.TrimSpace(s.Logo) != "" {
			// Keep chosen basename but fix extension
			target = replaceExt(localPath, ext)
		} else {
			filename := slugify(s.Name) + ext
			target = filepath.Join(logoDir, filename)
			sitePath := "/images/logos/" + filename
			sponsors[i].Logo = sitePath
			updatedJSON = true
		}

		if err := downloadImage(client, ua, s.Href, imgURL, target); err != nil {
			fmt.Printf("   ✖ download failed: %v\n", err)
			fail++
			dbg("sponsor=%q done in %s", s.Name, time.Since(sponsorStart))
			continue
		}
		fmt.Printf("   ✅ saved: %s\n", rel(target))
		success++
		dbg("sponsor=%q done in %s", s.Name, time.Since(sponsorStart))
	}

	fmt.Printf("\nSummary: %d saved, %d ok, %d failed\n", success, skipped, fail)

	if updatedJSON && !*dryRun {
		if err := writeSite(*siteJSONPath, raw, root, sponsors); err != nil {
			fatal("writing updated site.json", err)
		}
		fmt.Printf("📝 Updated only 'sponsors' in %s (backup created; other fields preserved).\n", *siteJSONPath)
	}
}

// ---- site.json helpers ----

func readSite(path string) (root map[string]json.RawMessage, sponsors []Sponsor, raw []byte, err error) {
	b, e := os.ReadFile(path)
	if e != nil {
		return nil, nil, nil, e
	}
	var m map[string]json.RawMessage
	if e = json.Unmarshal(b, &m); e != nil {
		return nil, nil, nil, e
	}
	var sp []Sponsor
	if spRaw, ok := m["sponsors"]; ok && len(spRaw) > 0 {
		if e = json.Unmarshal(spRaw, &sp); e != nil {
			return nil, nil, nil, fmt.Errorf("unmarshal sponsors: %w", e)
		}
	}
	return m, sp, b, nil
}

func writeSite(path string, original []byte, root map[string]json.RawMessage, updatedSponsors []Sponsor) error {
	backup := fmt.Sprintf("%s.bak-%d", path, time.Now().Unix())
	if err := os.WriteFile(backup, original, 0o644); err != nil {
		return fmt.Errorf("backup write: %w", err)
	}

	spBytes, err := json.Marshal(updatedSponsors)
	if err != nil {
		return fmt.Errorf("marshal sponsors: %w", err)
	}
	root["sponsors"] = spBytes

	pretty, err := json.MarshalIndent(root, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal root: %w", err)
	}
	return os.WriteFile(path, pretty, 0o644)
}

// ---- discovery & downloading ----

func discoverLogoURL(client *http.Client, ua, href string) (imgURL, ext string, err error) {
	dbg("discoverLogoURL: href=%s", href)
	tDisc := time.Now()
	base, err := url.Parse(href)
	if err != nil || base.Scheme == "" || base.Host == "" {
		return "", "", fmt.Errorf("invalid href: %s", href)
	}

	// 1) Fetch HTML and look for OG image / icons / logo-ish <img>
	html, err := getHTML(client, ua, href, href)
	if err == nil && len(html) > 0 {
		if u := findOGImage(html, base); u != "" && !isICO(u) {
			dbg("discoverLogoURL: og:image %s in %s", u, time.Since(tDisc))
			return u, extFromURLOrHead(client, ua, href, u), nil
		}
		if u := findIconLink(html, base); u != "" && !isICO(u) {
			dbg("discoverLogoURL: <link rel=icon> %s in %s", u, time.Since(tDisc))
			return u, extFromURLOrHead(client, ua, href, u), nil
		}
		if u := findLogoImg(html, base); u != "" && !isICO(u) {
			dbg("discoverLogoURL: <img ...logo...> %s in %s", u, time.Since(tDisc))
			return u, extFromURLOrHead(client, ua, href, u), nil
		}
	}

	// 2) Try common non-ICO icon paths (PNG/JPG/WEBP/SVG)
	candidates := []string{
		"/apple-touch-icon.png",
		"/apple-touch-icon-precomposed.png",
		"/favicon-196x196.png",
		"/favicon-192x192.png",
		"/favicon-180x180.png",
		"/favicon-152x152.png",
		"/favicon-144x144.png",
		"/favicon-96x96.png",
		"/favicon-64x64.png",
		"/favicon-32x32.png",
		"/favicon.png",
		"/logo.png",
		"/logo.jpg",
		"/logo.webp",
		"/logo.svg",
	}
	dbg("discoverLogoURL: trying %d common candidates", len(candidates))
	for _, c := range candidates {
		u := base.ResolveReference(&url.URL{Path: c}).String()
		tHead := time.Now()
		dbg("HEAD %s", u)
		if headOKNonICO(client, ua, href, u) {
			dbg("candidate OK %s in %s", u, time.Since(tHead))
			return u, extFromURLOrHead(client, ua, href, u), nil
		}
	}
	dbg("discoverLogoURL: no image found after %s", time.Since(tDisc))
	return "", "", errors.New("no viable image found")
}

func getHTML(client *http.Client, ua, referer, pageURL string) ([]byte, error) {
	req, _ := http.NewRequest("GET", pageURL, nil)
	req.Header.Set("User-Agent", ua)
	if referer != "" {
		req.Header.Set("Referer", referer)
	}
	dbgDumpReq(req)
	t := time.Now()
	dbg("GET %s (referer=%s)", pageURL, referer)
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK || !strings.Contains(strings.ToLower(resp.Header.Get("Content-Type")), "text/html") {
		return nil, fmt.Errorf("status %d or non-html", resp.StatusCode)
	}
	dbg("GET %s status=%d ct=%q in %s", pageURL, resp.StatusCode, resp.Header.Get("Content-Type"), time.Since(t))
	// 2MB cap
	b, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	return b, err
}

func findOGImage(html []byte, base *url.URL) string {
	re := regexp.MustCompile(`(?i)<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']`)
	m := re.FindSubmatch(html)
	if len(m) > 1 {
		return toAbsURL(base, string(m[1]))
	}
	return ""
}

func findIconLink(html []byte, base *url.URL) string {
	re := regexp.MustCompile(`(?i)<link[^>]+rel=["'][^"']*(apple-touch-icon|icon)[^"']*["'][^>]*href=["']([^"']+)["']`)
	for _, m := range re.FindAllSubmatch(html, -1) {
		u := toAbsURL(base, string(m[2]))
		if !isICO(u) {
			return u
		}
	}
	return ""
}

func findLogoImg(html []byte, base *url.URL) string {
	re := regexp.MustCompile(`(?i)<img[^>]+(?:src|data-src|data-original)=["']([^"']+logo[^"']*\.(?:png|jpe?g|webp|svg))["']`)
	m := re.FindSubmatch(html)
	if len(m) > 1 {
		return toAbsURL(base, string(m[1]))
	}
	return ""
}

func headOKNonICO(client *http.Client, ua, referer, u string) bool {
	t := time.Now()
	req, _ := http.NewRequest("HEAD", u, nil)
	req.Header.Set("User-Agent", ua)
	if referer != "" {
		req.Header.Set("Referer", referer)
	}
	dbgDumpReq(req)
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		dbg("HEAD %s status=%d ct=%q in %s", u, resp.StatusCode, resp.Header.Get("Content-Type"), time.Since(t))
		return false
	}
	ct := strings.ToLower(resp.Header.Get("Content-Type"))
	if !strings.HasPrefix(ct, "image/") {
		dbg("HEAD %s status=%d ct=%q in %s", u, resp.StatusCode, resp.Header.Get("Content-Type"), time.Since(t))
		return false
	}
	dbg("HEAD %s status=%d ct=%q in %s", u, resp.StatusCode, resp.Header.Get("Content-Type"), time.Since(t))
	return !strings.Contains(ct, "x-icon") && !strings.Contains(ct, "vnd.microsoft.icon")
}

func extFromURLOrHead(client *http.Client, ua, referer, u string) string {
	ext := strings.ToLower(filepath.Ext(strings.Split(u, "?")[0]))
	if ext == "" || ext == ".ico" {
		t := time.Now()
		dbg("HEAD (extFromURLOrHead) %s", u)
		req, _ := http.NewRequest("HEAD", u, nil)
		req.Header.Set("User-Agent", ua)
		if referer != "" {
			req.Header.Set("Referer", referer)
		}
		dbgDumpReq(req)
		resp, err := client.Do(req)
		if err == nil {
			defer resp.Body.Close()
			dbg("HEAD (extFromURLOrHead) %s status=%d ct=%q in %s", u, resp.StatusCode, resp.Header.Get("Content-Type"), time.Since(t))
			ct := strings.ToLower(resp.Header.Get("Content-Type"))
			switch {
			case strings.HasPrefix(ct, "image/png"):
				return ".png"
			case strings.HasPrefix(ct, "image/webp"):
				return ".webp"
			case strings.HasPrefix(ct, "image/avif"):
				return ".avif"
			case strings.HasPrefix(ct, "image/jpeg"):
				return ".jpg"
			case strings.HasPrefix(ct, "image/svg"):
				return ".svg"
			}
		}
	}
	if ext == "" || ext == ".ico" {
		return ".png"
	}
	return ext
}

func downloadImage(client *http.Client, ua, referer, imgURL, target string) error {
	t := time.Now()
	dbg("GET image %s (referer=%s)", imgURL, referer)
	req, _ := http.NewRequest("GET", imgURL, nil)
	req.Header.Set("User-Agent", ua)
	if referer != "" {
		req.Header.Set("Referer", referer)
	}
	dbgDumpReq(req)
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status %d for %s", resp.StatusCode, imgURL)
	}
	ct := strings.ToLower(resp.Header.Get("Content-Type"))
	if !strings.HasPrefix(ct, "image/") {
		return fmt.Errorf("not an image: %s", ct)
	}
	if strings.Contains(ct, "x-icon") || strings.Contains(ct, "vnd.microsoft.icon") {
		return fmt.Errorf("ICO not allowed")
	}
	dbg("GET image %s status=%d ct=%q len=%s in %s", imgURL, resp.StatusCode, ct, resp.Header.Get("Content-Length"), time.Since(t))

	// Ensure extension matches content-type
	target = replaceExt(target, extFromContentType(ct))
	tmp := target + ".part"
	if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
		return err
	}
	out, err := os.Create(tmp)
	if err != nil {
		return err
	}
	defer out.Close()
	if _, err = io.Copy(out, io.LimitReader(resp.Body, 50<<20)); err != nil {
		return err
	}
	out.Close()
	return os.Rename(tmp, target)
}

// ---- utils ----

func desiredLocalLogoPath(publicDir, logoDir string, s Sponsor) string {
	if strings.TrimSpace(s.Logo) == "" {
		return filepath.Join(logoDir, slugify(s.Name)+".png")
	}
	if strings.HasPrefix(s.Logo, "/") {
		return filepath.Join(publicDir, strings.TrimPrefix(s.Logo, "/"))
	}
	return filepath.Join(publicDir, s.Logo)
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	re := regexp.MustCompile(`[^a-z0-9]+`)
	s = re.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	if s == "" {
		return "logo"
	}
	return s
}

func fileExists(p string) bool {
	if fi, err := os.Stat(p); err == nil && !fi.IsDir() {
		return true
	}
	return false
}

func replaceExt(p, newExt string) string {
	if newExt == "" {
		return p
	}
	base := strings.TrimSuffix(p, filepath.Ext(p))
	return base + newExt
}

func extFromContentType(ct string) string {
	switch {
	case strings.HasPrefix(ct, "image/png"):
		return ".png"
	case strings.HasPrefix(ct, "image/jpeg"):
		return ".jpg"
	case strings.HasPrefix(ct, "image/webp"):
		return ".webp"
	case strings.HasPrefix(ct, "image/avif"):
		return ".avif"
	case strings.HasPrefix(ct, "image/svg"):
		return ".svg"
	default:
		return ".png"
	}
}

func toAbsURL(base *url.URL, found string) string {
	found = strings.TrimSpace(found)
	if found == "" {
		return ""
	}
	u, err := url.Parse(found)
	if err != nil {
		return ""
	}
	if u.Scheme == "" {
		return base.ResolveReference(u).String()
	}
	return u.String()
}

func rel(p string) string {
	r, _ := filepath.Rel(".", p)
	return r
}

func overlapsLower(vals []string, set map[string]bool) bool {
	for _, v := range vals {
		if set[strings.ToLower(strings.TrimSpace(v))] {
			return true
		}
	}
	return false
}

func keys(m map[string]bool) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	return out
}

func fatal(msg string, err error) {
	fmt.Fprintf(os.Stderr, "❌ %s: %v\n", msg, err)
	os.Exit(1)
}

func isICO(u string) bool {
	ext := strings.ToLower(filepath.Ext(strings.Split(u, "?")[0]))
	return ext == ".ico"
}

// ---- enrichment (discover website / instagram) ----

func enrichSponsor(client *http.Client, ua string, s *Sponsor, cfg EnrichConfig) (website, instagram string, err error) {
	name := strings.TrimSpace(s.Name)
	if name == "" {
		return "", "", errors.New("empty sponsor name")
	}
	switch cfg.Provider {
	case "serpapi":
		return enrichViaSerpAPI(client, ua, name, cfg.SerpAPIKey)
	case "openai":
		return enrichViaOpenAI(client, ua, name, cfg.OpenAIKey)
	case "hybrid":
		return enrichViaHybrid(client, ua, name, cfg)
	default:
		return "", "", fmt.Errorf("unknown provider: %s", cfg.Provider)
	}
}

func isAggregatorDomain(u string) bool {
	host := hostOnly(u)
	bad := []string{
		"facebook.com", "m.facebook.com", "instagram.com", "twitter.com", "x.com", "tiktok.com",
		"yelp.com", "tripadvisor.com", "opentable.com", "doordash.com", "grubhub.com", "ubereats.com", "linkedin.com",
		// prevent OpenAI platform/docs from ever being chosen as sponsor websites
		"openai.com", "platform.openai.com",
	}
	for _, b := range bad {
		if strings.HasSuffix(host, b) {
			return true
		}
	}
	return false
}

func isOpenAIDocsURL(u string) bool {
	u = strings.TrimSpace(u)
	if u == "" {
		return false
	}
	host := hostOnly(u)
	if host == "" {
		return false
	}
	if strings.HasSuffix(host, "openai.com") || strings.HasSuffix(host, "platform.openai.com") {
		if strings.Contains(u, "/docs") || strings.Contains(u, "/guides") || strings.Contains(u, "error-codes") {
			return true
		}
		return true
	}
	return false
}

func hostOnly(u string) string {
	if p, err := url.Parse(u); err == nil {
		return strings.ToLower(p.Host)
	}
	return ""
}

func trimURL(u string) string {
	// keep scheme+host path root only
	p, err := url.Parse(u)
	if err != nil {
		return u
	}
	p.RawQuery = ""
	p.Fragment = ""
	return p.String()
}

// --- domain matching heuristics ---

// igHandle normalizes an Instagram URL or handle to just the handle (no @, no URL)
func igHandle(u string) string {
	u = strings.TrimSpace(u)
	if u == "" {
		return ""
	}
	reIG := regexp.MustCompile(`(?i)https?://(?:www\.)?instagram\.com/([A-Za-z0-9_.]+)/?`)
	if m := reIG.FindStringSubmatch(u); len(m) > 1 {
		h := m[1]
		// discard post/reel paths
		if strings.EqualFold(h, "p") || strings.EqualFold(h, "reel") {
			return ""
		}
		return h
	}
	// if they accidentally gave a handle already, keep it
	u = strings.TrimPrefix(u, "@")
	return u
}
func tokenizeName(n string) []string {
	n = strings.ToLower(n)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	n = re.ReplaceAllString(n, " ")
	raw := strings.Fields(n)
	stop := map[string]bool{
		"the": true, "and": true, "co": true, "llc": true, "inc": true, "company": true,
		"north": true, "park": true, "san": true, "diego": true, "studio": true, "group": true,
		"usa": true, "of": true, "at": true, "&": true,
	}
	out := make([]string, 0, len(raw))
	for _, w := range raw {
		if stop[w] || len(w) < 3 {
			continue
		}
		out = append(out, w)
	}
	return out
}

func looksLikeOfficial(name, u string) bool {
	host := hostOnly(u)
	if host == "" || isAggregatorDomain(u) {
		return false
	}
	toks := tokenizeName(name)
	if len(toks) == 0 {
		return false
	}
	for _, t := range toks {
		if strings.Contains(host, t) {
			return true
		}
	}
	return false
}

// Collect multiple candidates from SerpAPI for retrieval-augmented selection.
func serpCandidates(client *http.Client, ua, name, key string) (webCandidates []string, igCandidates []string, err error) {
	if strings.TrimSpace(key) == "" {
		return nil, nil, errors.New("SerpAPI key missing")
	}
	// General web search (bias to San Diego to disambiguate)
	base := "https://serpapi.com/search.json?q=" + url.QueryEscape(name+" san diego") + "&engine=google&num=10&api_key=" + url.QueryEscape(key)
	body, err := httpGET(client, ua, base, "")
	if err != nil {
		return nil, nil, err
	}
	re := regexp.MustCompile(`\"link\":\"([^\"]+)\"`)
	for _, m := range re.FindAllSubmatch(body, -1) {
		link := string(m[1])
		if isOpenAIDocsURL(link) {
			continue
		}
		if !isAggregatorDomain(link) {
			webCandidates = append(webCandidates, trimURL(link))
		}
	}
	// Fallback: broader query if none found
	if len(webCandidates) == 0 {
		base2 := "https://serpapi.com/search.json?q=" + url.QueryEscape(name) + "&engine=google&num=10&api_key=" + url.QueryEscape(key)
		body2, err2 := httpGET(client, ua, base2, "")
		if err2 == nil {
			for _, m := range re.FindAllSubmatch(body2, -1) {
				link := string(m[1])
				if isOpenAIDocsURL(link) {
					continue
				}
				if !isAggregatorDomain(link) {
					webCandidates = append(webCandidates, trimURL(link))
				}
			}
		}
	}

	// Instagram-focused search
	igQ := "https://serpapi.com/search.json?q=" + url.QueryEscape(name+" instagram san diego") + "&engine=google&num=10&api_key=" + url.QueryEscape(key)
	igBody, _ := httpGET(client, ua, igQ, "")
	reIG := regexp.MustCompile(`https?://(?:www\.)?instagram\.com/([A-Za-z0-9_.]+)/?`)
	for _, mm := range reIG.FindAllSubmatch(igBody, -1) {
		h := string(mm[1])
		if strings.EqualFold(h, "p") || strings.EqualFold(h, "reel") {
			continue
		}
		igCandidates = append(igCandidates, "https://www.instagram.com/"+h+"/")
	}
	return webCandidates, igCandidates, nil
}

func enrichViaSerpAPI(client *http.Client, ua, name, key string) (website, instagram string, err error) {
	webs, igs, err := serpCandidates(client, ua, name, key)
	if err != nil {
		return "", "", err
	}
	// Website: pick the first that looks official
	for _, link := range webs {
		if looksLikeOfficial(name, link) {
			website = link
			break
		}
	}
	// Instagram: pick the first candidate if any
	if instagram == "" {
		for _, ig := range igs {
			if ig != "" {
				instagram = ig
				break
			}
		}
	}
	return website, instagram, nil
}

// Optional: OpenAI (LLM guess). This may be less reliable; used only if explicitly set.
func enrichViaOpenAI(client *http.Client, ua, name, key string) (website, instagram string, err error) {
	if strings.TrimSpace(key) == "" {
		return "", "", errors.New("OpenAI key missing")
	}
	// JSON-only Chat Completions request using strict schema and low temperature
	dbg("OpenAI lookup %q", name)

	type reqMsg struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}
	payloadObj := map[string]interface{}{
		"model":           "gpt-5",
		"response_format": map[string]string{"type": "json_object"},
	}

	sysPrompt := strings.Join([]string{
		"You are a data extraction assistant.",
		"Return ONLY a JSON object with EXACT fields {\"website\": string, \"instagram\": string}.",
		"Provide the business’s OFFICIAL homepage and OFFICIAL Instagram profile.",
		"Rules:",
		"- Exclude aggregators/directories/marketplaces: Yelp, Google Maps, OpenTable, DoorDash, Grubhub, UberEats, TripAdvisor, Facebook pages, Linktree, etc.",
		"- Website must be the business’s own domain (prefer https).",
		"- Instagram must be a profile URL like https://www.instagram.com/<handle>/ (not hashtags, locations, posts).",
		"- If uncertain about a field, return an empty string for that field.",
		"Do not include any text outside the JSON.",
		"",
		"Example output:",
		"{\"website\": \"https://example.com/\", \"instagram\": \"https://www.instagram.com/example/\"}",
	}, "\n")

	// Nudge for SD locality to reduce ambiguity
	userPrompt := "Business name: " + jsonEscape(name) + "\nCity: San Diego\nState: CA"

	payloadObj["messages"] = []reqMsg{
		{Role: "system", Content: sysPrompt},
		{Role: "user", Content: userPrompt},
	}

	b, _ := json.Marshal(payloadObj)
	endpoint := "https://api.openai.com/v1/chat/completions"
	if debug {
		dbg("OpenAI POST %s", endpoint)
		dbg("OpenAI payload: %s", string(b))
	}
	req, _ := http.NewRequest("POST", endpoint, bytes.NewReader(b))
	req.Header.Set("User-Agent", ua)
	req.Header.Set("Authorization", "Bearer "+key)
	req.Header.Set("Content-Type", "application/json")
	dbgDumpReq(req)

	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	if debug && resp != nil {
		dbg("OpenAI status=%d ct=%q req-id=%q", resp.StatusCode, resp.Header.Get("Content-Type"), resp.Header.Get("x-request-id"))
	}
	defer resp.Body.Close()
	rb, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if debug {
		dbg("OpenAI bytes=%d", len(rb))
		dbg("OpenAI response body:\n%s", truncBytes(rb, 4000))
	}
	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("openai http %d: %s", resp.StatusCode, truncBytes(rb, 400))
	}

	// Extract assistant message content
	type chatResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	var cr chatResp
	if err := json.Unmarshal(rb, &cr); err != nil || len(cr.Choices) == 0 {
		return "", "", fmt.Errorf("openai parse failure")
	}
	content := cr.Choices[0].Message.Content
	content = strings.TrimSpace(content)
	if strings.HasPrefix(content, "```") {
		content = strings.TrimPrefix(content, "```json")
		content = strings.TrimPrefix(content, "```JSON")
		content = strings.TrimPrefix(content, "```")
		if i := strings.LastIndex(content, "```"); i >= 0 {
			content = content[:i]
		}
		content = strings.TrimSpace(content)
	}
	if !strings.HasPrefix(content, "{") {
		reObj := regexp.MustCompile(`\{[\s\S]*\}`)
		if m := reObj.FindString(content); m != "" {
			content = m
		}
	}

	// Parse strict JSON
	var obj struct {
		Website   string `json:"website"`
		Instagram string `json:"instagram"`
	}
	if err := json.Unmarshal([]byte(content), &obj); err == nil {
		website = strings.TrimSpace(obj.Website)
		instagram = strings.TrimSpace(obj.Instagram)
	} else {
		// Fallback: regex any URLs from content if model deviates
		reW := regexp.MustCompile(`https?://[^\s"]+`)
		urls := reW.FindAllString(content, -1)
		for _, u := range urls {
			if instagram == "" && strings.Contains(u, "instagram.com/") {
				reIG := regexp.MustCompile(`https?://(?:www\.)?instagram\.com/([A-Za-z0-9_.]+)/?`)
				if m := reIG.FindStringSubmatch(u); len(m) > 1 {
					instagram = "https://www.instagram.com/" + m[1] + "/"
					continue
				}
			}
			if website == "" && looksLikeOfficial(name, u) {
				website = trimURL(u)
			}
		}
	}
	return website, instagram, nil
}

// chooseViaOpenAI asks the LLM to select the OFFICIAL website/instagram from candidate lists.
func chooseViaOpenAI(name string, webCandidates, igCandidates []string, key string) (website, instagram string, err error) {
	if strings.TrimSpace(key) == "" {
		return "", "", errors.New("OpenAI key missing")
	}

	type reqMsg struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}
	payloadObj := map[string]interface{}{
		"model":           "gpt-5",
		"response_format": map[string]string{"type": "json_object"},
	}

	sysPrompt := strings.Join([]string{
		"You are a data extraction assistant.",
		"Choose the business's OFFICIAL homepage and OFFICIAL Instagram from the provided candidates for: " + name + ".",
		"Return ONLY a JSON object with fields {\"website\": string, \"instagram\": string}.",
		"Rules:",
		"- Prefer domains owned by the business; exclude Yelp/Google/OpenTable/Linktree/Facebook/TikTok/Twitter/etc.",
		"- Instagram must be a profile like https://www.instagram.com/<handle>/ (not hashtags, locations, posts).",
		"- Use https URLs. If none are clearly official, return empty strings.",
	}, "\n")

	userPrompt := "Web candidates:\n" + strings.Join(webCandidates, "\n") +
		"\n\nInstagram candidates:\n" + strings.Join(igCandidates, "\n")

	payloadObj["messages"] = []reqMsg{
		{Role: "system", Content: sysPrompt},
		{Role: "user", Content: userPrompt},
	}

	b, _ := json.Marshal(payloadObj)
	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(b))
	req.Header.Set("Authorization", "Bearer "+key)
	req.Header.Set("Content-Type", "application/json")

	httpClient := &http.Client{Timeout: 30 * time.Second}
	resp, err := httpClient.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()
	rb, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("openai http %d: %s", resp.StatusCode, truncBytes(rb, 400))
	}

	type chatResp struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}
	var cr chatResp
	if err := json.Unmarshal(rb, &cr); err != nil || len(cr.Choices) == 0 {
		return "", "", fmt.Errorf("openai parse failure")
	}
	content := cr.Choices[0].Message.Content
	// Normalize content before JSON unmarshal (copy from enrichViaOpenAI)
	content = strings.TrimSpace(content)
	if strings.HasPrefix(content, "```") {
		content = strings.TrimPrefix(content, "```json")
		content = strings.TrimPrefix(content, "```JSON")
		content = strings.TrimPrefix(content, "```")
		if i := strings.LastIndex(content, "```"); i >= 0 {
			content = content[:i]
		}
		content = strings.TrimSpace(content)
	}
	if !strings.HasPrefix(content, "{") {
		reObj := regexp.MustCompile(`\{[\s\S]*\}`)
		if m := reObj.FindString(content); m != "" {
			content = m
		}
	}

	// Parse strict JSON if possible
	var obj struct {
		Website   string `json:"website"`
		Instagram string `json:"instagram"`
	}
	if json.Unmarshal([]byte(content), &obj) == nil {
		website = strings.TrimSpace(obj.Website)
		instagram = strings.TrimSpace(obj.Instagram)
	} else {
		// Fallback: pull URLs from content
		reW := regexp.MustCompile(`https?://[^\s"]+`)
		urls := reW.FindAllString(content, -1)
		for _, u := range urls {
			if instagram == "" && strings.Contains(u, "instagram.com/") {
				reIG := regexp.MustCompile(`https?://(?:www\.)?instagram\.com/([A-Za-z0-9_.]+)/?`)
				if m := reIG.FindStringSubmatch(u); len(m) > 1 {
					instagram = "https://www.instagram.com/" + m[1] + "/"
					continue
				}
			}
			if website == "" && looksLikeOfficial(name, u) {
				website = trimURL(u)
			}
		}
	}
	return website, instagram, nil
}

// enrichViaHybrid uses SerpAPI to gather candidates and OpenAI to choose the official links.
// Fallbacks:
//   - If OpenAI key is missing or choose fails, returns SerpAPI's best guess.
//   - If SerpAPI fails, falls back to the previous OpenAI single-shot method.
func enrichViaHybrid(client *http.Client, ua, name string, cfg EnrichConfig) (website, instagram string, err error) {
	// 1) Gather candidates via SerpAPI
	webs, igs, serr := serpCandidates(client, ua, name, cfg.SerpAPIKey)
	if serr != nil || (len(webs) == 0 && len(igs) == 0) {
		// Serp failed — try the single-shot OpenAI as a last resort
		if strings.TrimSpace(cfg.OpenAIKey) == "" {
			return "", "", nil
		}
		w, ig, oerr := enrichViaOpenAI(client, ua, name, cfg.OpenAIKey)
		if oerr != nil {
			dbg("OpenAI fallback error: %v", oerr)
			return "", "", nil
		}
		return w, ig, nil
	}
	// 2) If OpenAI key present, ask it to choose; otherwise pick heuristically
	if strings.TrimSpace(cfg.OpenAIKey) != "" {
		w, ig, oerr := chooseViaOpenAI(name, webs, igs, cfg.OpenAIKey)
		if oerr == nil && (w != "" || ig != "") {
			return w, ig, nil
		}
	}
	// 3) Heuristic fallback using SerpAPI candidates
	for _, link := range webs {
		if looksLikeOfficial(name, link) {
			website = link
			break
		}
	}
	if instagram == "" && len(igs) > 0 {
		instagram = igs[0]
	}
	return website, instagram, nil
}

func httpGET(client *http.Client, ua, u, referer string) ([]byte, error) {
	t := time.Now()
	dbg("HTTP GET %s", u)
	req, _ := http.NewRequest("GET", u, nil)
	req.Header.Set("User-Agent", ua)
	if referer != "" {
		req.Header.Set("Referer", referer)
	}
	dbgDumpReq(req)
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status %d", resp.StatusCode)
	}
	b, err := io.ReadAll(io.LimitReader(resp.Body, 2<<20))
	if err == nil {
		dbg("HTTP GET %s status=%d bytes=%d in %s", u, resp.StatusCode, len(b), time.Since(t))
	}
	return b, err
}

func jsonEscape(s string) string {
	b, _ := json.Marshal(s)
	// json.Marshal wraps in quotes; strip
	if len(b) >= 2 && b[0] == '"' && b[len(b)-1] == '"' {
		unq, _ := strconv.Unquote(string(b))
		return unq
	}
	return s
}

// loadDotEnv loads KEY=VALUE pairs from a .env file into process env.
// Lines beginning with '#' are ignored. Empty lines are skipped.
// If a key already exists in the environment, it is not overwritten.
func loadDotEnv(path string) error {
	if strings.TrimSpace(path) == "" {
		return nil
	}
	f, err := os.Open(path)
	if err != nil {
		// silent if file does not exist
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	defer f.Close()
	b, err := io.ReadAll(f)
	if err != nil {
		return err
	}
	lines := strings.Split(string(b), "\n")
	for _, ln := range lines {
		s := strings.TrimSpace(ln)
		if s == "" || strings.HasPrefix(s, "#") {
			continue
		}
		// Support KEY=VALUE with optional quotes
		eq := strings.IndexByte(s, '=')
		if eq <= 0 {
			continue
		}
		key := strings.TrimSpace(s[:eq])
		val := strings.TrimSpace(s[eq+1:])
		// Strip optional surrounding quotes
		if len(val) >= 2 && ((val[0] == '"' && val[len(val)-1] == '"') || (val[0] == '\'' && val[len(val)-1] == '\'')) {
			unq, err := strconv.Unquote(val)
			if err == nil {
				val = unq
			} else {
				// best-effort: drop outer quotes
				val = strings.Trim(val, "'\"")
			}
		}
		if key == "" {
			continue
		}
		if os.Getenv(key) == "" {
			_ = os.Setenv(key, val)
		}
	}
	return nil
}
