# SoNo Fest & Chili Cook-Off – New Design Integration Plan

This document tells the build agent how to integrate the new Netlify prototype design  
(https://darling-squirrel-2a99c9.netlify.app/) with the current SoNo Fest content.  

---

## Global Build Rules

- **Base template:** Clone the homepage layout (header → hero → sections → footer).
- **Header:** Logo (link `/`), nav items, sticky “Buy Tickets” button.
- **Footer:** Beneficiary statement, quick links, social, contact.
- **HTML/CSS:** Use semantic tags (`<header>`, `<nav>`, `<main>`, `<footer>`).  
  Use BEM-like classes (`.section__title`, `.card__media`, `.btn--ticket`).
- **Accessibility:** Alt text on all images, contrast AA+, aria attributes on accordions.
- **SEO:**  
  - Unique `<title>` + `<meta description>` per page.  
  - JSON-LD `Event` on Home & Attend.  
  - Canonical URLs.  
- **Performance:** Lazy-load images, preconnect to TicketTailor, inline critical CSS for header/hero.
- **Data source:** Use JSON or CMS config with `eventDate`, `ticketUrl`, `ticketPrices`, `pickupSchedule`, and `year`.

---

## Routes & Redirects

- `/` → Home
- `/tickets/` → Tickets
- `/chili/` → Chili Entry (restaurant signup)
- `/merch/` → Merch
- `/faq/` → FAQ
- `/contact/` → Contact
- `/map/` → Map (new)

**Redirects:** Map old slugs (`/booze/`, `/vendors/`, `/volunteers/`, `/map/`) → new equivalents.  
Use `_redirects` in Netlify.

---

## Component Inventory

Build these reusable components:

1. **Header** (nav + CTA)
2. **Hero** (variant: full for home, short for subpages)
3. **Countdown** (reads `eventDate`, shows days left)
4. **FeatureTiles** (4-up: Chili, Music, Kids, Booze)
5. **SponsorStrip** (logo grid)
6. **PricingTable** (ticket options)
7. **PickupSchedule** (dates/locations)
8. **FAQAccordion**
9. **MapBlock** (static map + PDF + legend)
10. **Footer**

---

## Page Specs

### Home (`/`)
- Hero: H1 “SoNo Fest & Chili Cook-Off 2025”, subhead with date/time/location, CTAs: Buy Tickets, Enter Chili, Volunteer.
- Countdown: days until Dec 7, 2025.
- FeatureTiles:  
  - Chili Cook-Off → `/tickets/` + `/chili/`  
  - Live Music → `/music/` (stub if not ready)  
  - Kids Zone → `/faq/#kids`  
  - Booze Garden → `/booze/`
- SponsorStrip: show current sponsors, hide if empty.

### Tickets (`/tickets/`)
- Hero (short).
- PricingTable (from JSON):  
  - Ceramic Bowl $30 (in-person only, 5 tastings)  
  - Commemorative Mug $30 (online, 5 tastings)  
  - Paper Bowl $25 (online, 5 tastings)  
  - Add-on Tastings $22 (booth, 5 tastings)  
- PickupSchedule (Fri Dec 6 – Sun Dec 8, McKinley + SDCC + booth).  
- TicketTailor CTA button.  
- FAQ subset: tastings per pass, veg/vegan availability, add-ons.

### Chili Entry (`/chili/`)
- Hero.  
- Steps list: eligibility, rules, deadlines.  
- CTA → Restaurant application form.

### Merch (`/merch/`)
- Gallery of merch images.  
- CTA → Shop link (Shopify/Bonfire/etc).

### FAQ (`/faq/`)
- Accordion:  
  - Tickets & tasting  
  - Pickup  
  - Kids & strollers  
  - Dogs policy (service animals only)  
  - Parking, transit, bikes, rideshare  
  - Weather (rain or shine)  
  - Sustainability (reuse mugs, composting)
- Updated to 2025 (drop stale 2023 language).

### Contact (`/contact/`)
- Form: Name, Email, Message.  
- Role-based inboxes: sponsors@, press@, vendors@, volunteers@.  
- Hook Netlify Forms.

### Map (`/map/`)
- Static map image (PNG/SVG).  
- Legend: entrances, chili rows, stages, booze garden, restrooms, ADA, parking, rideshare, first aid.  
- Downloadable PDF.  
- Link out to Google Maps for directions.

---

## Data Model (JSON Example)

```json
{
  "site": {
    "year": 2025,
    "eventDate": "2025-12-07T11:00:00-08:00",
    "location": "32nd & Thorn St, North Park, San Diego",
    "ticketTailorUrl": "https://www.tickettailor.com/..."
  },
  "tickets": {
    "options": [
      {"name": "Ceramic Bowl", "price": 30, "tastings": 5, "channel": "in-person"},
      {"name": "Commemorative Mug", "price": 30, "tastings": 5, "channel": "online"},
      {"name": "Paper Bowl", "price": 25, "tastings": 5, "channel": "online"},
      {"name": "Add-on Tastings", "price": 22, "tastings": 5, "channel": "booth"}
    ],
    "pickup": [
      {"when": "Fri Dec 6, 2–5 PM", "where": "McKinley Elementary"},
      {"when": "Fri Dec 6, 6–8 PM", "where": "San Diego Ceramic Connection"},
      {"when": "Sat Dec 7, 1–4 PM", "where": "San Diego Ceramic Connection"},
      {"when": "Sun Dec 8, 11–5 PM", "where": "Ticket Booth (limited)"}
    ]
  }
}
```

---

## Build Tasks (for Codex Agent)

1. **Set up routes** `/`, `/tickets/`, `/chili/`, `/merch/`, `/faq/`, `/contact/`, `/map/`.  
2. **Import prototype HTML/CSS** from Netlify design and keep class structure.  
3. **Build reusable components**: Header, Hero, Countdown, FeatureTiles, SponsorStrip, PricingTable, PickupSchedule, FAQAccordion, MapBlock, Footer.  
4. **Populate Tickets page** from JSON (pricing, pickup, TicketTailor).  
5. **Rewrite FAQ** using 2025 info.  
6. **Add MapBlock** with static image + PDF link.  
7. **Wire CTAs** (tickets → TicketTailor; chili entry → Google Form; volunteer → signup).  
8. **Implement JSON config** for event date, ticket info, pickup schedule, year.  
9. **Add SEO metadata & JSON-LD** per page.  
10. **Add `_redirects` file** for legacy slugs.  
11. **QA checklist:**  
    - Home shows correct date, countdown works.  
    - Tickets table/pricing/pickup match copy.  
    - FAQ updated to 2025.  
    - Map has labels & PDF.  
    - All CTAs work.  
    - No 404s; redirects functional.  

---

## Delivery Sprints

- **Sprint 1:** Port prototype, build Home, Tickets, FAQ, Contact, redirects.  
- **Sprint 2:** Add Map, Chili Entry, Merch, volunteer wiring.  

**Definition of Done:** Home has working countdown, Tickets has correct pricing + CTA, FAQ is fresh, Map is usable, CTAs link correctly.
