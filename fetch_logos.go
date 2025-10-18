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
	Provider   string // ddg | serpapi | openai (ddg is keyless default)
	SerpAPIKey string
	OpenAIKey  string
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
	searchProvider := flag.String("search-provider", "ddg", "Search provider: ddg|serpapi|openai")
	serpAPIKey := flag.String("serpapi-key", "", "SerpAPI key (or SERPAPI_KEY env / .env)")
	openAIKey := flag.String("openai-key", "", "OpenAI API key (or OPENAI_API_KEY env / .env)")
	flag.Parse()

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

		// Filters
		if *onlyActive && !s.Active {
			continue
		}
		if len(catFilter) > 0 && !overlapsLower(s.Category, catFilter) {
			continue
		}

		// Enrich website automatically when missing/bad; Instagram only when --enrich-missing
		needHref := strings.TrimSpace(s.Href) == "" || isOpenAIDocsURL(s.Href)
		needIG := strings.TrimSpace(s.Instagram) == ""
		shouldEnrich := needHref || (econf.Enable && needIG)
		if shouldEnrich {
			if isOpenAIDocsURL(s.Href) {
				fmt.Printf("   ↻ %s href looks wrong (OpenAI docs); searching for official site...\n", s.Name)
			}
			// If we only need Href and enrichment flag is off, force DDG (keyless) provider
			eff := econf
			if needHref && !econf.Enable {
				eff.Provider = "ddg"
			}
			foundHref, foundIG, err := enrichSponsor(client, ua, &s, eff)
			if err != nil {
				fmt.Printf("   (enrich warn) %s: %v\n", s.Name, err)
			}
			changed := false
			if needHref && strings.TrimSpace(foundHref) != "" {
				sponsors[i].Href = foundHref
				changed = true
				fmt.Printf("   🔗 set href → %s\n", foundHref)
			}
			// Only set Instagram when enrichment is explicitly enabled
			if econf.Enable && needIG && strings.TrimSpace(foundIG) != "" {
				sponsors[i].Instagram = foundIG
				changed = true
				fmt.Printf("   📸 set instagram → %s\n", foundIG)
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
			continue
		}

		if strings.TrimSpace(s.Href) == "" {
			fmt.Printf("⚠️  %-30s no href to discover logo; logo path set=%t\n", s.Name, strings.TrimSpace(s.Logo) != "")
			fail++
			continue
		}

		fmt.Printf("→ %-30s discovering logo from %s\n", s.Name, s.Href)
		if *dryRun {
			fmt.Println("   (dry-run) skipping discovery/download")
			continue
		}

		imgURL, ext, err := discoverLogoURL(client, ua, s.Href)
		if err != nil {
			fmt.Printf("   ✖ discovery failed: %v\n", err)
			fail++
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
			continue
		}
		fmt.Printf("   ✅ saved: %s\n", rel(target))
		success++
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
	base, err := url.Parse(href)
	if err != nil || base.Scheme == "" || base.Host == "" {
		return "", "", fmt.Errorf("invalid href: %s", href)
	}

	// 1) Fetch HTML and look for OG image / icons / logo-ish <img>
	html, err := getHTML(client, ua, href, href)
	if err == nil && len(html) > 0 {
		if u := findOGImage(html, base); u != "" && !isICO(u) {
			return u, extFromURLOrHead(client, ua, href, u), nil
		}
		if u := findIconLink(html, base); u != "" && !isICO(u) {
			return u, extFromURLOrHead(client, ua, href, u), nil
		}
		if u := findLogoImg(html, base); u != "" && !isICO(u) {
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
	for _, c := range candidates {
		u := base.ResolveReference(&url.URL{Path: c}).String()
		if headOKNonICO(client, ua, href, u) {
			return u, extFromURLOrHead(client, ua, href, u), nil
		}
	}
	return "", "", errors.New("no viable image found")
}

func getHTML(client *http.Client, ua, referer, pageURL string) ([]byte, error) {
	req, _ := http.NewRequest("GET", pageURL, nil)
	req.Header.Set("User-Agent", ua)
	if referer != "" {
		req.Header.Set("Referer", referer)
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK || !strings.Contains(strings.ToLower(resp.Header.Get("Content-Type")), "text/html") {
		return nil, fmt.Errorf("status %d or non-html", resp.StatusCode)
	}
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
	req, _ := http.NewRequest("HEAD", u, nil)
	req.Header.Set("User-Agent", ua)
	if referer != "" {
		req.Header.Set("Referer", referer)
	}
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return false
	}
	ct := strings.ToLower(resp.Header.Get("Content-Type"))
	if !strings.HasPrefix(ct, "image/") {
		return false
	}
	return !strings.Contains(ct, "x-icon") && !strings.Contains(ct, "vnd.microsoft.icon")
}

func extFromURLOrHead(client *http.Client, ua, referer, u string) string {
	ext := strings.ToLower(filepath.Ext(strings.Split(u, "?")[0]))
	if ext == "" || ext == ".ico" {
		req, _ := http.NewRequest("HEAD", u, nil)
		req.Header.Set("User-Agent", ua)
		if referer != "" {
			req.Header.Set("Referer", referer)
		}
		resp, err := client.Do(req)
		if err == nil {
			defer resp.Body.Close()
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
	req, _ := http.NewRequest("GET", imgURL, nil)
	req.Header.Set("User-Agent", ua)
	if referer != "" {
		req.Header.Set("Referer", referer)
	}
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
	default:
		// ddg keyless
		return enrichViaDDG(client, ua, name)
	}
}

// Try to choose a likely website domain and instagram profile from DuckDuckGo HTML results
func enrichViaDDG(client *http.Client, ua, name string) (website, instagram string, err error) {
	ws, _ := ddgFirstExternal(client, ua, name, name+" official site")
	if ws == "" {
		ws, _ = ddgFirstExternal(client, ua, name, name)
	}
	ig, _ := ddgFindInstagram(client, ua, name+" instagram")
	return ws, ig, nil
}

func ddgFirstExternal(client *http.Client, ua, name, query string) (string, error) {
	u := "https://duckduckgo.com/html/?q=" + url.QueryEscape(query)
	body, err := httpGET(client, ua, u, "")
	if err != nil {
		return "", err
	}
	// Find result links: DuckDuckGo HTML uses result__a anchors; href often goes through /l/?uddg=...
	re := regexp.MustCompile(`(?i)<a[^>]+class=\"result__a\"[^>]+href=\"([^\"]+)\"`)
	for _, m := range re.FindAllSubmatch(body, -1) {
		raw := string(m[1])
		resolved := ddgResolveRedirect(raw)
		if resolved == "" {
			continue
		}
		// skip socials/aggregators for primary website
		if isAggregatorDomain(resolved) || strings.Contains(resolved, "instagram.com/") {
			continue
		}
		if looksLikeOfficial(name, resolved) {
			return trimURL(resolved), nil
		}
	}
	return "", errors.New("no external result")
}

func ddgFindInstagram(client *http.Client, ua, query string) (string, error) {
	u := "https://duckduckgo.com/html/?q=" + url.QueryEscape(query)
	body, err := httpGET(client, ua, u, "")
	if err != nil {
		return "", err
	}
	// Prefer instagram profile links
	re := regexp.MustCompile(`(?i)https?://(?:www\.)?instagram\.com/([A-Za-z0-9_.]+)/?`)
	if m := re.FindSubmatch(body); len(m) > 1 {
		handle := string(m[1])
		// ignore content links like /p/...
		if strings.ToLower(handle) != "p" && strings.ToLower(handle) != "reel" && strings.ToLower(handle) != "stories" {
			return "https://www.instagram.com/" + handle + "/", nil
		}
	}
	return "", errors.New("no instagram found")
}

func ddgResolveRedirect(href string) string {
	// DuckDuckGo may use "/l/?kh=-1&uddg=<encoded>" links. Extract uddg if present.
	if strings.HasPrefix(href, "/l/") || strings.Contains(href, "uddg=") {
		if u, err := url.Parse("https://duckduckgo.com" + href); err == nil {
			if enc := u.Query().Get("uddg"); enc != "" {
				if decoded, err := url.QueryUnescape(enc); err == nil {
					return decoded
				}
			}
		}
	}
	// Otherwise return as absolute if it's already a full URL
	if strings.HasPrefix(href, "http://") || strings.HasPrefix(href, "https://") {
		return href
	}
	return ""
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

// Optional: SerpAPI
func enrichViaSerpAPI(client *http.Client, ua, name, key string) (website, instagram string, err error) {
	if strings.TrimSpace(key) == "" {
		return enrichViaDDG(client, ua, name)
	}
	base := "https://serpapi.com/search.json?q=" + url.QueryEscape(name) + "&engine=google&num=10&api_key=" + url.QueryEscape(key)
	body, err := httpGET(client, ua, base, "")
	if err != nil {
		return "", "", err
	}
	// Extract URLs from "link":"..."
	re := regexp.MustCompile(`\"link\":\"([^\"]+)\"`)
	links := re.FindAllSubmatch(body, -1)
	for _, m := range links {
		link := string(m[1])
		if !isAggregatorDomain(link) && looksLikeOfficial(name, link) {
			website = trimURL(link)
			break
		}
	}
	// Instagram search
	bodyIG, _ := httpGET(client, ua, "https://serpapi.com/search.json?q="+url.QueryEscape(name+" instagram")+"&engine=google&num=10&api_key="+url.QueryEscape(key), "")
	reIG := regexp.MustCompile(`https?://(?:www\.)?instagram\.com/([A-Za-z0-9_.]+)/?`)
	if mm := reIG.FindSubmatch(bodyIG); len(mm) > 1 {
		h := string(mm[1])
		if strings.ToLower(h) != "p" && strings.ToLower(h) != "reel" {
			instagram = "https://www.instagram.com/" + h + "/"
		}
	}
	return website, instagram, nil
}

// Optional: OpenAI (LLM guess). This may be less reliable; used only if explicitly set.
func enrichViaOpenAI(client *http.Client, ua, name, key string) (website, instagram string, err error) {
	if strings.TrimSpace(key) == "" {
		return enrichViaDDG(client, ua, name)
	}
	// Minimal client to OpenAI Chat Completions API
	payload := `{"model":"gpt-4o-mini","messages":[{"role":"system","content":"Return JSON with fields website and instagram for the official presence of the business. If unsure, leave empty strings."},{"role":"user","content":"Business name: ` + jsonEscape(name) + `"}],"temperature":0}`
	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBufferString(payload))
	req.Header.Set("User-Agent", ua)
	req.Header.Set("Authorization", "Bearer "+key)
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	// Extract simple URLs from the response to avoid adding a full schema
	reW := regexp.MustCompile(`https?://[^\"\s]+`)
	urls := reW.FindAllString(string(b), -1)
	for _, u := range urls {
		if strings.Contains(u, "instagram.com/") && instagram == "" {
			// normalize probable profile
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
	return website, instagram, nil
}

func httpGET(client *http.Client, ua, u, referer string) ([]byte, error) {
	req, _ := http.NewRequest("GET", u, nil)
	req.Header.Set("User-Agent", ua)
	if referer != "" {
		req.Header.Set("Referer", referer)
	}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status %d", resp.StatusCode)
	}
	return io.ReadAll(io.LimitReader(resp.Body, 2<<20))
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
