# A7 Property — Myanmar Real Estate Marketplace

A bilingual (English/Myanmar) real estate marketplace for Myanmar, built with Next.js 16, React 19, Tailwind CSS 4, and Framer Motion. Deployed on Cloudflare Workers via [vinext](https://github.com/cloudflare/vinext).

## Features

### Discovery & Search
- **Real map integration** — Leaflet + OpenStreetMap with price markers, popups, and auto-fit bounds
- **URL-driven filters** — purpose, location, type, price range, bedrooms, bathrooms, amenities, verified
- **List + Map view** toggle with live results
- **Advanced filter sidebar** with quick filter bar
- **Sort options** — recommended, newest, price-asc

### Property Detail
- Statically generated pages for 100 properties
- Image gallery, verification badge, full facts
- Amenities, description, furniture status, nearby essentials
- Owner card with contact / schedule viewing actions
- Inquiry system (messages + viewing requests)
- Share + favorite (persisted to localStorage)

### AI Assistant
- Natural language property search parser
- Ranked recommendations with match % and explainable reasons
- Side-by-side comparison (up to 3 properties)
- Quick prompt chips + header popover widget

### Dual Account System
- **Seeker account** — search, save homes, message owners, schedule viewings
- **Lister account** — post listings, manage inquiries, track analytics
- Role selection at sign-up (upgradable later)
- Route protection — seeker/lister-only pages
- Auth provider (localStorage-based, ready for D1 database)

### Owner & Agent CRM
- Metric cards (views, messages, inquiry conversion)
- Weekly views chart
- Verification center with document upload UI
- Listing editor (create/edit drafts)
- Leads inbox with reply form
- Workspace settings + notifications

### Bilingual Pricing
- Language toggle switches price format:
  - English: `1,500,000 MMK` / `3M MMK`
  - Myanmar: `၁၅ သိန်း` / `၃ သန်း`
- Myanmar number conversion throughout

### Animated Icons & UI
- **Iconify** integration — 300,000+ icons from Phosphor, Heroicons, Tabler, etc.
- **AnimatedIcon** component with spring physics (scale, rotate, bounce, wiggle, pulse)
- Brand social icons (Google, Apple, Facebook, Messenger, Viber, Telegram, YouTube)
- Smooth step transitions on sign-in (AnimatePresence)
- Page route fade transitions

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + vinext |
| Runtime | React 19 |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |
| Icons | Iconify (@iconify/react) + Phosphor |
| Maps | Leaflet + react-leaflet + OpenStreetMap |
| Database | Drizzle ORM + Cloudflare D1 (schema ready) |
| Deployment | Cloudflare Workers |
| Fonts | Noto Sans Myanmar |

## Project Structure

```
app/
├── page.tsx              # Homepage (hero, listings, townships, AI promo)
├── layout.tsx            # Root layout (LanguageProvider + AuthProvider + Leaflet CSS)
├── template.tsx          # Route fade wrapper
├── search/               # Search page with filters + map
├── properties/[id]/      # Property detail pages (SSG)
├── assistant/            # AI property consultant
├── dashboard/            # Seeker dashboard (saved, messages, viewings)
├── owner/                # Lister CRM (listings, leads, analytics)
├── agent/                # Agent workspace
├── sign-in/              # Dual account sign-in
├── profile/              # Account settings
├── privacy / terms / community / help/

components/
├── auth/                 # AuthProvider, RequireAuth, SignInView
├── property/             # Cards, detail view, gallery, map, inquiry
├── search/               # Search bar, filters, map panel, cards
├── dashboard/            # CRM, metrics, listing editor
├── assistant/            # AI consultant, popover, recommendations
├── layout/               # Header, intent navigation, route fade
├── i18n/                 # Language provider + switcher
├── ui/                   # Button, Card, Sheet, Badge, AnimatedIcon, MyanmarPrice
├── brand/                # A7 logo
├── content/              # Reusable info pages
├── profile/              # User profile settings

db/
├── schema.ts             # Drizzle schema (users, seekers, listers, properties, inquiries, messages, saved_homes)
├── index.ts              # D1 connection

lib/
├── properties.ts         # Property data + filtering + language-aware pricing
├── township-coordinates.ts # Lat/lng for 9 Myanmar townships
├── myanmar-numbers.ts    # Myanmar digit conversion
├── property-assistant.ts # AI search parser + ranking
├── local-storage.ts      # Persistent storage with sync
├── mock-users.ts         # Mock data for dashboards

data/
└── properties.json       # 100 mock properties
```

## Database Schema

```
users              → base account (email, accountType, phoneVerified, idVerified)
seekerProfiles     → seeker-specific (budget, preferred townships, property types)
listerProfiles     → lister-specific (agency, license, verification, rating)
properties         → listings (listerId, price, lat/lng, status, verification)
inquiries          → seeker → lister contact requests
messages           → inquiry thread messages
savedHomes         → seeker favorites
savedSearches      → saved filter alerts
notifications      → price changes, messages, new matches
```

## Getting Started

### Prerequisites

- Node.js `>=22.13.0`

### Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Build

```bash
npm run build
```

### Lint & Type Check

```bash
npm run lint
npx tsc --noEmit
```

### Database Migrations

```bash
npm run db:generate
```

## Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Verify production build |
| `npm test` | Build + verify rendered HTML |
| `npm run lint` | ESLint check |
| `npm run db:generate` | Generate Drizzle migrations |

## Account Types

| Account | Routes | Features |
|---|---|---|
| **Seeker** | `/dashboard`, `/profile` | Save homes, message owners, schedule viewings, price alerts |
| **Lister** | `/owner`, `/agent` | Post listings, manage inquiries, CRM, analytics, verification |
| **Guest** | `/`, `/search`, `/properties/*` | Browse, search, view property details |

## Languages

- English (default)
- Myanmar (မြန်မာ) — full UI + price format translation
- Toggle via language switcher in header/footer
- Persisted to localStorage, synced across tabs

## License

Private project. All rights reserved.

## Links

- [GitHub Repository](https://github.com/aungpyaeheinofficial-pixel/A7-Real-Estate-V1)
- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)