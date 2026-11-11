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

## Admin accounts

The counter panel uses per-person accounts, not a shared key. Passwords are hashed with PBKDF2
(SHA-256, 60k iterations, per-account salt) in D1; sessions are random 32-byte tokens stored hashed
and sent as an HttpOnly, Secure, SameSite=Strict cookie that lasts 12 hours.

Roles: **owner** (adds admins, issues reset codes, disables accounts) and **admin** (times sessions,
blocks stations). The panel refuses station writes without a session, and `POST` requests from
another origin are rejected.

First run: open `/admin` and create the main admin with the `ADMIN_KEY` setup key, or call
`POST /api/auth/setup` with `x-admin-key`. Locked out? `POST /api/auth/recover` with the same secret
resets an owner password.

### Password reset

There is no SMS/WhatsApp API wired in, so the verification happens in the WhatsApp chat the shop
already uses:

1. The admin enters their username on `/admin` → a reset request is recorded (3 per hour, same
   response whether the username exists or not).
2. The owner verifies who they are on WhatsApp, opens **Team**, and taps **Reset code**.
3. The panel shows a 6-digit code valid for 30 minutes, single use. The owner sends it to the admin.
4. The admin enters the code and a new password. All that admin's sessions are signed out.

### Adding admins

The owner creates a username, name, role and (optional) temporary password. The panel shows the
temporary password once, with a **Notify main WhatsApp** link that opens a prefilled message to
`SHOP.whatsapp`. The new admin is prompted to change the password after signing in.

### Tables

`admins`, `admin_sessions`, `reset_requests`, `audit_log`, plus the existing `stations` and
`sessions`. Created automatically on the first request; there is no separate migration step.

## Credit

Site by **Techsomaj**. All rights reserved.
