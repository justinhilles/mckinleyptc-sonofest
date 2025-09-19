You are a senior front-end engineer. Implement the SoNo Fest & Chili Cook-Off website per the attached `integration-plan.md` and use the HTML/CSS template located in template/index.html

## Tech stack (primary)
- Next.js 14+ (App Router) + TypeScript
- CSS: import the prototype’s CSS exactly as-is; add minimal utilities if needed
- Deployed on Netlify (create `_redirects`)
- No server DB; use JSON config for content

## Deliverables
1) A runnable Next.js app with the following routes:
   - `/` (Home), `/tickets/`, `/chili-entry/`, `/merch/`, `/faq/`, `/contact/`, `/map/`
2) Reusable components (one directory):
   - Header, Hero (full + short), Countdown, FeatureTiles, SponsorStrip,
     PricingTable, PickupSchedule, FAQAccordion (a11y), MapBlock, Footer
3) Content config JSON that drives dates, tickets, pickup, links:
   - `app/content/site.json`, `app/content/tickets.json`, `app/content/faq.json`
4) SEO & structured data:
   - Per-page `<title>` & `<meta description>`
   - JSON-LD `Event` on `/` and `/tickets/` (offers = TicketTailor URL)
5) Accessibility:
   - Landmarks, focus styles, alt text, keyboard-navigable FAQ accordion
6) Performance:
   - Preconnect to TicketTailor, lazy-load noncritical images, width/height on images
7) Netlify `_redirects` for legacy slugs → new routes
8) A `README.md` with run/build/deploy instructions

## Source material & behavior
- Follow `integration-plan.md` for structure and copy.
- Clone layout patterns from the prototype (header, hero, content sections, footer).
- Home Hero CTAs: Buy Tickets → `site.ticketTailorUrl`; Enter Chili → `/chili-entry/`; Volunteer (placeholder to be wired later or link provided in config).
- Countdown reads from `site.eventDate`.
- Tickets page uses PricingTable + PickupSchedule with data from `tickets.json`.
- FAQ page uses accordion fed by `faq.json`.
- Map page: static labeled image (placeholder), legend list, downloadable PDF (placeholder), external link to Google Maps.
- Contact page: simple form; wire to Netlify Forms (HTML attributes only).

## File tree (create exactly)
- `app/`
  - `layout.tsx` (global HTML, header/footer wrappers, metadata defaults)
  - `page.tsx` (Home)
  - `(routes)/tickets/page.tsx`
  - `(routes)/chili-entry/page.tsx`
  - `(routes)/merch/page.tsx`
  - `(routes)/faq/page.tsx`
  - `(routes)/contact/page.tsx`
  - `(routes)/map/page.tsx`
  - `components/`
    - `Header.tsx`
    - `Hero.tsx`
    - `Countdown.tsx`
    - `FeatureTiles.tsx`
    - `SponsorStrip.tsx`
    - `PricingTable.tsx`
    - `PickupSchedule.tsx`
    - `FAQAccordion.tsx`
    - `MapBlock.tsx`
    - `Footer.tsx`
  - `content/`
    - `site.json`
    - `tickets.json`
    - `faq.json`
- `public/`
  - `images/hero.jpg` (placeholder)
  - `images/map.png` (placeholder static map)
  - `docs/map.pdf` (placeholder downloadable)
- `public/_redirects`
- `styles/` (imported prototype CSS + optional utils)
- `README.md`

## JSON content (seed these now; values editable later)
`app/content/site.json`
{
  "year": 2025,
  "eventDate": "2025-12-07T11:00:00-08:00",
  "location": "32nd & Thorn St, North Park, San Diego",
  "ticketTailorUrl": "https://www.tickettailor.com/...", 
  "social": { "facebook": "", "instagram": "" },
  "links": {
    "chiliEntryForm": "",
    "volunteerSignup": ""
  }
}

`app/content/tickets.json`
{
  "options": [
    {"name": "Ceramic Bowl", "price": 30, "tastings": 5, "channel": "in-person"},
    {"name": "Commemorative Mug", "price": 30, "tastings": 5, "channel": "online"},
    {"name": "Paper Bowl", "price": 25, "tastings": 5, "channel": "online"},
    {"name": "Add-on Tastings", "price": 22, "tastings": 5, "channel": "booth"}
  ],
  "pickup": [
    {"when": "Fri Dec 6, 2–5 PM", "where": "McKinley Elementary"},
    {"when": "Fri Dec 6, 6–8 PM", "where": "San Diego Ceramic Connection, 3216 Thorn St"},
    {"when": "Sat Dec 7, 1–4 PM", "where": "San Diego Ceramic Connection"},
    {"when": "Sun Dec 8, 11–5 PM", "where": "Ticket Booth (limited)"}
  ]
}

`app/content/faq.json`
[
  {"q": "Do I need a ticket?", "a": "The event is free to attend; chili tasting requires a pass."},
  {"q": "How many tastings per pass?", "a": "Each pass includes 5 tastings."},
  {"q": "Vegetarian/vegan options?", "a": "Yes, several restaurants offer them."},
  {"q": "Are dogs allowed?", "a": "Service animals only. Please leave pets at home."},
  {"q": "Is the event rain or shine?", "a": "Yes, the event runs rain or shine."}
]

## Component requirements (key props)
- `Hero`: props `{ title, subhead, ctas?: [{label, href, variant}] }`
- `Countdown`: reads `site.eventDate`; displays “X DAYS UNTIL KICKOFF”. On the day: “THIS SUNDAY!” 
- `PricingTable`: props `{ options: TicketOption[] }`
- `PickupSchedule`: props `{ items: {when: string; where: string}[] }`
- `FAQAccordion`: keyboard accessible (Enter/Space to toggle), `aria-expanded`, `aria-controls`, focus states
- `SponsorStrip`: hide if no sponsors in config

## Home content (seed now; can refine later)
- H1: “SoNo Fest & Chili Cook-Off 2025”
- Subhead: “Sunday, December 7, 2025 · 11 AM – 5 PM · 32nd & Thorn St, North Park, San Diego”
- CTAs: Buy Tickets → `site.ticketTailorUrl`; Enter Chili → `/chili-entry/`; Volunteer → `site.links.volunteerSignup || "/contact/"`
- Tiles: Chili Cook-Off (/tickets, later /chili), Live Music (/music placeholder), Kids Zone (#kids in FAQ), Booze Garden (/booze placeholder)
- Impact strip: “100% of proceeds benefit McKinley Elementary Foundation.”

## `_redirects` (create file in /public)
# legacy slugs to new pages
/booze      /faq   301
/vendors    /shop-eat 301
/volunteers /contact 301
/map-old    /map   301

## Accessibility & SEO
- Add landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`).
- Provide `alt=""` for decorative images and meaningful alt for logos/maps.
- Per-route metadata using Next.js metadata API.
- JSON-LD in `<script type="application/ld+json">` with `Event` (name, startDate, location, organizer, offers.url).

## Commands
- Initialize project: `npx create-next-app@latest sono-website --ts --eslint --app --src-dir false --import-alias "@/*"`
- Add files per tree above; import prototype CSS into `styles/`.
- Run: `npm run dev`
- Build: `npm run build && npm run start`

## Acceptance criteria
- All routes render and match the plan’s block order.
- Countdown shows correct days until 2025-12-07 (America/Los_Angeles implied).
- Tickets page uses JSON data and shows TicketTailor CTA.
- FAQ is accordion-based, keyboard accessible, content from JSON.
- Map page shows static map image, legend list, and a downloadable PDF link.
- Header has persistent “Buy Tickets” CTA across routes.
- All images specify width/height, noncritical images lazy-load.
- `_redirects` exists and maps the legacy slugs.
- No TypeScript errors; `npm run build` passes.

## If Next.js is not available
- Produce a static site using 11ty or Vite + vanilla HTML. Keep the same file tree under `/src`, compile to `/dist`, and ensure Netlify reads `_redirects`. All other requirements remain the same.

Deliver the complete repository with code, JSON content, and README.