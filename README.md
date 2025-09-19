# SoNo Fest & Chili Cook-Off 2025 Web App

This repository contains the Next.js 14 site for the 2025 SoNo Fest & Chili Cook-Off. The build ports the Netlify prototype styles, delivers the required routes, and drives dynamic content from JSON config files under `app/content`.

## Prerequisites
- Node.js 18+
- npm 9+

Install dependencies once:

```bash
npm install
```

## Local Development
Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 to view the site. The app router hot-reloads when you edit files.

## Build & Production Preview
Create an optimized production build and preview it locally:

```bash
npm run build
npm run start
```

## Linting
Run type-aware ESLint checks:

```bash
npm run lint
```

## Content Management
Structured data lives in JSON files so content editors do not need to touch TypeScript:

- `app/content/site.json` — global details (event date, ticket URL, sponsors, social links).
- `app/content/tickets.json` — ticket options and pickup schedule powering `/tickets/`.
- `app/content/faq.json` — question/answer pairs rendered on `/faq/`.

Updating these files automatically refreshes the relevant components.

## Key Features
- Routes: `/`, `/tickets/` (Tasting Passes), `/chili-entry/`, `/booze/`, `/merch/`, `/faq/`, `/contact/` (includes map & directions).
- Reusable components for hero layouts, countdown, pricing, FAQs, map, and more under `app/components/`.
- Accessible FAQ accordion (keyboard + ARIA), Netlify-ready contact form, and lazy-loaded imagery.
- Event JSON-LD injected on Home and Tasting Passes pages for richer search results; Booze Garden celebrates local beverage partners.
- Netlify-ready `_redirects` in `public/` for legacy slug support.

## Deployment
Deploy to Netlify using the default Next.js build command:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- Ensure the `_redirects` file under `public/` is included.

Set environment variables (if any) in Netlify’s dashboard. No server-side secrets are required for this build.

## License
Content and assets are provided for SoNo Fest & Chili Cook-Off 2025. Use with permission from the McKinley Elementary Foundation.
