# Bhai Brother Video Game

The shop site for Bhai Brother Video Game — PS5, PS4 and an arcade corner in Green City, Block C,
Mohammadpur, Dhaka. React + Vite, with a small Cloudflare Worker + D1 backend for the live station
board, the staff panel and the noticeboard.

## Run it

```bash
bun install
bun run dev      # http://localhost:3000
bun test         # pricing, Dhaka hours, booking and station logic
bun run build    # typecheck + production build into dist/
bun run qr       # regenerate public/qr-site.svg from the short link
```

## Two deployments, one source

| Site | Where | Contains |
| --- | --- | --- |
| Customer site | GitHub Pages, `docs/` on `main` → https://saadkibriya.github.io/Bhai-Brother-Video-Game/ | Home, games, rates, booking, visit, live board, noticeboard |
| Counter site | Cloudflare Worker (Freebuff Sites) | The same public pages plus `/admin`, `/admin/settings`, `/qr` and the API |

The panel needs a database, so it only exists on the Worker host. The customer site's Staff link
opens that host.

```bash
# customer build — rerun and commit docs/ to publish
VITE_PUBLIC_ONLY=1 \
VITE_SITE_BASE=/Bhai-Brother-Video-Game/ \
VITE_OUT_DIR=docs \
VITE_SITE_URL=https://saadkibriya.github.io/Bhai-Brother-Video-Game \
VITE_API_BASE=https://site-1aa9915efd1d466db27090dd5abebf4b.freebuff.page \
bun run build
```

That build hides the staff routes, rewrites canonical/Open Graph URLs, `robots.txt`, `sitemap.xml`
and the manifest, writes one `index.html` per public route (Pages has no rewrites) plus a `404.html`
fallback, and drops `sw.js` and the QR artwork. The live board and noticeboard read the public API
on the Worker host.

## Layout

| Path | Purpose |
| --- | --- |
| `src/data/contact.ts` | Address, phone, WhatsApp number, map links |
| `src/data/shop.ts` | Games, station copy, passes, FAQ, tournament |
| `src/lib/pricing.ts` | Rates, 30-minute billing, squad pass, quotes |
| `src/lib/hours.ts` | Dhaka opening hours and open/closed status |
| `src/lib/stations.ts` | Station types, timers, alerts, API calls |
| `src/lib/siteMode.ts` | Public-build flags, API base, router base, panel URL |
| `src/pages/` | Home, Games, Rates, Book, Visit, Admin, Admin settings, QR, 404 |
| `src/styles.css` | The whole design system, hand-written |
| `deploy/worker.js` | Worker: API, D1 schema, auth, stations, announcements |
| `scripts/optimize-images.mjs` | Source photos → webp covers, icons, `og.jpg` |
| `public/` | Favicon, icons, manifest, OG image, QR image, service worker |

## Staff panel

`/admin` on the counter host. Accounts are per person: passwords are PBKDF2-hashed in D1, sessions
are random tokens in an HttpOnly, Secure, SameSite=Strict cookie that lasts a year and slides forward
while it is used. Roles are **owner** (manage admins, reset codes, disable accounts) and **admin**
(run the counter).

- **Stations** — consoles get a timer with 10/5/0-minute alerts; the arcade is walk-up and can only
  be blocked (out of order). `End session` logs the time; `Cancel` (offered once a session is
  overdue) frees the station without logging.
- **Noticeboard** — post a heading and text; it appears on the customer home page immediately.
  Hide takes it off the site, delete removes it.
- **Team** — the owner adds admins, issues one-time 6-digit reset codes and disables accounts.
- **Account settings** — change username or password (current password required; a password change
  signs out other devices).

### API

| Route | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/api/status` | GET | none | Stations, timers, player names, today's totals |
| `/api/announcements` | GET | none | Active announcements |
| `/api/auth/login` \| `logout` \| `me` \| `password` \| `username` | POST/GET | cookie | Session and account |
| `/api/auth/setup` \| `forgot` \| `reset` \| `recover` | POST/GET | key or code | First run and password recovery |
| `/api/station` | POST | cookie | `start` \| `stop` \| `cancel` \| `block` \| `unblock` |
| `/api/admin/announcements` | GET/POST | cookie | Noticeboard management |
| `/api/admin/team` | GET/POST | owner | Admin accounts |

`ADMIN_KEY` (a Sites secret) is only used for first-run setup and owner recovery. D1 creates its
tables on first request; there is no separate migration step.

## Content edits

- Prices: `src/lib/pricing.ts` (`RATES`, `SQUAD_PASS`) and `PASSES` in `src/data/shop.ts`.
- Hours: `src/lib/hours.ts`; a close time after midnight is handled.
- Games: the `GAMES` array in `src/data/shop.ts`; covers are optional.
- Photos: drop originals in `src/assets/source/`, run `bun run images`.

## Credit

Site by **Techsomaj**. All rights reserved.
