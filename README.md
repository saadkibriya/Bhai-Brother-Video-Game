# Bhai Brother Video Game

The shop site for Bhai Brother Video Game — PS5, PS4 and an arcade corner in Green City,
Block C, Mohammadpur, Dhaka.

Static React + Vite build. No database, no login, no fake admin panel. Bookings are
composed on the page and sent to the shop's WhatsApp, which is how the counter actually
works.

## Run it

```bash
bun install
bun run dev      # http://localhost:3000
```

```bash
bun test         # pricing, Dhaka hours, slot and booking-message logic
bun run build    # typecheck + production build into dist/
```

## What is where

| Path | Purpose |
| --- | --- |
| `src/data/contact.ts` | Address, phone, WhatsApp number, map links |
| `src/data/shop.ts` | Games, station copy, passes, FAQ, tournament |
| `src/lib/pricing.ts` | Rates, 30-minute billing, squad pass, quotes |
| `src/lib/hours.ts` | Dhaka opening hours and open/closed status |
| `src/lib/booking.ts` | Dates, slots, phone validation, WhatsApp message |
| `src/pages/` | Home, Games, Rates, Book, Visit, 404 |
| `src/styles.css` | The whole design system, hand-written |
| `scripts/optimize-images.mjs` | Source photos → webp covers, icons, `og.jpg` |

## Editing content

- **Prices** live in `src/lib/pricing.ts` (`RATES`, `SQUAD_PASS`) and `PASSES` in
  `src/data/shop.ts`. The calculator, booking estimate and rate board all read from those.
- **Hours** live in `src/lib/hours.ts`. A close time after midnight (`01:00`) is handled.
- **Games** are a plain array in `src/data/shop.ts`. Covers are optional; tiles without one
  get a typographic placeholder.
- **Photos**: drop originals in `src/assets/source/`, run `bun run images`, and import the
  generated webp from `src/assets/images/`.
- **Bookings** go to `SHOP.whatsapp` in `src/data/contact.ts`. Change that number and the
  whole booking flow follows.

## Deploying

`bun run build` produces `dist/` with no server requirement. It is deployed as a static
site (Freebuff Sites). The app uses client-side routing, so the host must serve
`index.html` for unknown paths (SPA fallback).

`supabase/` and the old spec documents were removed with the fake backend; they remain in
git history if a real booking database is ever added.

## Live station status and the counter panel

`/` shows a live board for the three stations (PS5 #1, PS4 #1, Arcade cabinet): free, in use with a
running timer, or blocked. The counter panel is `/admin` — the footer links to it as "Staff panel".

Both are backed by the Worker API in `deploy/worker.js` and a D1 database bound as `DB`:

| Route | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/api/status` | GET | none | Stations, running timers, today's session count |
| `/api/admin/verify` | POST | `x-admin-key` | Check the key before unlocking the panel |
| `/api/station` | POST | `x-admin-key` | `{ id, action }` with `start` \| `stop` \| `block` \| `unblock` |

The Worker creates the `stations` and `sessions` tables and seeds the three stations on first use.
`start` stamps `started_at`; `stop` writes the rounded minute count to `sessions` and frees the
station; `block` marks it out of service (and refuses to start a timer until unblocked).

The panel key lives in the `ADMIN_KEY` secret, never in the bundle. Set it under
**Sites → Secrets**, then open `/admin` and unlock with the same value. The key is kept in
`sessionStorage` for that tab only, and the panel's Lock button clears it. If `ADMIN_KEY` is
missing, the public board still works and the panel says so instead of accepting writes.

`ADMIN_KEY` must be set for both the preview and production environments before writes work there.
