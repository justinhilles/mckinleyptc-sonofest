package main

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"
)

type logoTarget struct {
	Name       string
	Basename   string   // filename without extension
	Candidates []string // non-ICO candidates tried in order
	Referer    string   // optional
	Notes      string   // optional, printed if all fail
}

func main() {
	logoDir := "public/images/logos"
	if err := os.MkdirAll(logoDir, 0o755); err != nil {
		fmt.Println("❌ error creating logo dir:", err)
		os.Exit(1)
	}

	client := &http.Client{Timeout: 30 * time.Second}
	ua := "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36"

	logos := []logoTarget{
		{
			Name:     "Finca",
			Basename: "finca",
			Candidates: []string{
				"https://finca.wine/wp-content/uploads/2023/09/finca_logo.png",
			},
			Referer: "https://finca.wine/",
		},
		{
			Name:     "North Park Creamery",
			Basename: "northparkcreamery",
			Candidates: []string{
				"https://images.squarespace-cdn.com/content/v1/5f4946fc4d578f3e053ddd88/1621013765771-2J2385S5NV08R41R5C71/NPC%2BLogo%2BDesign-v7Final-FullColor.png",
			},
			Referer: "https://www.northparkcreamery.com/",
		},
		{
			Name:     "Tacotarian",
			Basename: "tacotarian",
			Candidates: []string{
				// Shopify theme/CDN guesses that commonly work (will be skipped if 404):
				"https://eattacotarian.com/cdn/shop/files/logo_closed.svg?v=1706654028&width=369",
			},
			Referer: "https://eattacotarian.com/",
			Notes:   "If these fail, I’ll swap in a confirmed PNG from their theme; Shopify paths change often.",
		},
		{
			Name:     "UrbanLife Cafe",
			Basename: "urbanlife",
			Candidates: []string{
				"https://ugc.production.linktr.ee/028a8051-ff48-486f-b5f7-44f2c0da57eb_UrbanLife-Cafe-Brown.jpeg?io=true&size=avatar-v3_0",
			},
			Referer: "https://www.urbanlifesd.org/",
		},
		{
			Name:     "Super Cocina",
			Basename: "supercocina",
			Candidates: []string{
				"https://www.supercocinasd.com/wp-content/themes/supercocina/css/images/h1logo.png",
			},
			Referer: "https://www.supercocinasd.com/",
			Notes:   "If still failing, their WP media path likely changed; I can grab a fresh PNG from their header.",
		},
		{
			Name:     "Ale Tales Taproom",
			Basename: "aletales",
			Candidates: []string{
				"https://aletalestaproom.com/wp-content/uploads/2021/09/cropped-cropped-cropped-logo4-01-e1631659129551.png",
			},
			Referer: "https://aletalestaproom.com/",
		},
		{
			Name:     "Biersal",
			Basename: "biersal",
			Candidates: []string{
				"https://static.wixstatic.com/media/2a507a_9d6178f575334e51b3cd73dc24a6dbb4~mv2.jpg/v1/fill/w_789,h_779,al_c,q_85,enc_avif,quality_auto/IMG_0921.jpg",
			},
			Referer: "https://www.biersalkitchen.com/",
			Notes:   "If both fail, I’ll switch to a signage PNG from their site gallery (non-ICO).",
		},
		{
			Name:     "Kairoa Brewing Co",
			Basename: "kairoa",
			Candidates: []string{
				// BentoBox sites move frequently; try likely asset spots first:
				"https://images.getbento.com/accounts/ef2a0536fc6eb41e06e9d521b66cc1e2/media/images/26909New_Main_Logo.png",
			},
			Referer: "https://www.kairoa.com/",
			Notes:   "If still failing, I’ll extract the exact BentoBox logo URL from the page source.",
		},
		{
			Name:     "The Wise Ox",
			Basename: "wiseox",
			Candidates: []string{
				"https://images.squarespace-cdn.com/content/v1/60f1cb4c5d0b772116b48e7e/adda6476-b2ff-48e0-8d77-95b4e4b6e921/TRG_WiseOx_Wordmark_red-01.png?format=1500w",
				"https://www.thewiseoxsd.com/wp-content/uploads/2020/09/WiseOx_Logo_2C-1.png",
			},
			Referer: "https://www.thewiseoxsd.com/",
		},
		{
			Name:     "Cori",
			Basename: "cori",
			Candidates: []string{
				"https://images.squarespace-cdn.com/content/v1/5f6b918a6dba8d66a233b45c/1600891595442-TSO2CSA0AMP92LY89JQZ/Untitled-1.png?format=1500w",
			},
			Referer: "https://www.coripasta.com/",
		},
		{
			Name:     "Mabel's Gone Fishing",
			Basename: "mabels",
			Candidates: []string{
				"https://static.wixstatic.com/media/11cfc0_59da7a7e036b43a088494d56e5fc67eb~mv2.png",
				"https://static.wixstatic.com/media/11cfc0_59da7a7e036b43a088494d56e5fc67eb~mv2.png/v1/fill/w_851,h_493,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/Mabel%27s%20Written%20Logo%20Artboard%201_4x.png",
			},
			Referer: "https://www.mabelsgonefishing.com/",
		},
	}

	fmt.Printf("⬇️  Attempting to download %d restaurant logos into %s\n\n", len(logos), logoDir)
	ok := 0
	for _, t := range logos {
		fp, err := fetchOne(client, ua, t, logoDir)
		if err != nil {
			fmt.Printf("⚠️  %-22s → %v", t.Name, err)
			if t.Notes != "" {
				fmt.Printf("  (%s)", t.Notes)
			}
			fmt.Println()
			continue
		}
		ok++
		fmt.Printf("✅ %-22s → %s\n", t.Name, fp)
	}
	fmt.Printf("\nDone. %d/%d saved (non-ICO only) to %s\n", ok, len(logos), logoDir)
}

func fetchOne(client *http.Client, ua string, t logoTarget, dir string) (string, error) {
	for _, src := range t.Candidates {
		fp, err := tryDownload(client, ua, t.Referer, t.Basename, dir, src)
		if err == nil {
			// Reject .ico even if server returns 200
			if strings.HasSuffix(strings.ToLower(fp), ".ico") {
				_ = os.Remove(fp)
				continue
			}
			return fp, nil
		}
	}
	return "", errors.New("all non-ICO sources failed")
}

func tryDownload(client *http.Client, ua, referer, basename, dir, src string) (string, error) {
	req, err := http.NewRequest("GET", src, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("User-Agent", ua)
	if referer != "" {
		req.Header.Set("Referer", referer)
	}

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("bad status %d for %s", resp.StatusCode, src)
	}

	ct := strings.ToLower(resp.Header.Get("Content-Type"))
	ext := extFromContentType(ct)
	if ext == "" {
		ext = strings.ToLower(filepath.Ext(path.Base(req.URL.Path)))
		if i := strings.Index(ext, "?"); i >= 0 {
			ext = ext[:i]
		}
	}
	if ext == "" {
		ext = ".png"
	}
	// Hard reject ICO here too, even if present in path
	if ext == ".ico" {
		return "", fmt.Errorf("skipping .ico source %s", src)
	}

	target := filepath.Join(dir, basename+ext)
	out, err := os.Create(target)
	if err != nil {
		return "", err
	}
	defer out.Close()

	if _, err = io.Copy(out, resp.Body); err != nil {
		return "", err
	}
	return target, nil
}

func extFromContentType(ct string) string {
	switch {
	case strings.HasPrefix(ct, "image/png"):
		return ".png"
	case strings.HasPrefix(ct, "image/svg"):
		return ".svg"
	case strings.HasPrefix(ct, "image/webp"):
		return ".webp"
	case strings.HasPrefix(ct, "image/avif"):
		return ".avif"
	case strings.HasPrefix(ct, "image/jpeg"):
		return ".jpg"
	default:
		return ""
	}
}
