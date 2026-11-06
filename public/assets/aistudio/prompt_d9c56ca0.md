# Master Prompt — paste this into your coding agent

> Attach / place the whole `gameshop-docs` folder in the repo (e.g. `/docs/spec/`) before pasting.

---

You are a senior full-stack engineer and product designer. Build a production-ready, premium, very fast website for a PS4 / PS5 / arcade game shop in Bangladesh, and put it in a GitHub repository ready to deploy for **free**.

## Source of truth
Read these files completely before writing any code, in this order, and follow them exactly:
1. `README.md` — overview
2. `pvd.md` — product goals, features, default decisions
3. `srs.md` — every requirement (IDs like FR-BKG-02), data model, RLS, functions, business rules
4. `requirements.md` — stack, free-tier limits, repo structure, env vars, workflows
5. `design.md` — the "Midnight Arena" design system; match it closely
6. `info.md` — real shop data (anything marked SAMPLE or `{{...}}` = placeholder; keep it editable from admin)
7. `qa-test.md` — tests you must implement and pass
8. `research.md` — background only

If two files disagree: `srs.md` > `design.md` > `requirements.md` > `pvd.md`. If something is genuinely missing, choose the simplest option that keeps cost at ৳0, write it down in `docs/DECISIONS.md`, and continue — don't stop to ask unless a choice would cost money or delete data.

## Hard constraints
- **৳0/month.** Only: GitHub (repo, Pages, Actions), Supabase Free, optionally Cloudflare Pages/Turnstile free. No paid APIs, no SMS, no payment gateway.
- **Security lives in Postgres**: RLS on every table (default deny), all booking/status/leaderboard logic in `SECURITY DEFINER` SQL functions as specified. Never trust the browser.
- Only the Supabase **anon** key in frontend code. The **service-role** key is used only inside the `staff-reset-password` Edge Function via Supabase secrets. Never commit any secret; add `.env.example`.
- All shop-time logic in **Asia/Dhaka**, stored as UTC.
- Login = phone number + password using the synthetic-email method in FR-ACC-03 (email confirmation off). Phone normalisation per FR-ACC-02.
- No PlayStation logos or face-button symbols; no scraped game cover art — use generated covers (design.md §6) unless the admin uploads an image.
- Performance budgets in `design.md` §10 and NFR-PERF-* are requirements, not suggestions. Lazy-load admin, booking, leaderboard routes.
- TypeScript strict, ESLint + Prettier, no `any` without a comment explaining why.

## Build in phases — commit after each, keep CI green
1. **Scaffold**: Vite + React + TS + Tailwind + router (HashRouter when `VITE_DEPLOY_TARGET=github`, BrowserRouter for `cloudflare`), tokens.css from design.md, fonts via @fontsource, i18n (en/bn), layout (header, footer, floating WhatsApp/Call), theme toggle.
2. **Database**: `supabase/migrations` (schema → RLS → functions → triggers), `seed.sql` generated from `info.md` §H, pgTAP tests from qa-test.md §5. Include `ping()`.
3. **Pure logic in `src/lib`** with unit tests first: `pricing.ts` (FR-PRC-05), `hours.ts` (FR-HRS-01..03 incl. past-midnight), `phone.ts`, `tiers.ts`, `displayName.ts`, `format.ts`. Server SQL must produce the same results as these.
4. **Public pages**: Home, Games, Pricing (+calculator, arcade 3 coins = ৳10), Hours & Contact, Leaderboard, Events, FAQ & Rules, Gallery, 404. Live station board with Supabase Realtime. SEO tags, JSON-LD LocalBusiness, sitemap, robots, OG image.
5. **Members**: Register, Login, Profile (stats, tier progress, upcoming, history, cancel), booking wizard with availability slot picker, success screen with code + WhatsApp prefilled link.
6. **Admin** (`/admin`, staff+): Bookings inbox (default page), walk-ins, stations, games, pricing, hours & special hours, announcements, events, FAQ/rules, gallery (client-side WebP compression), settings, members (ban, reset password, roles — admin only), dashboard with busiest-hours heatmap, CSV export, audit log.
7. **PWA** (vite-plugin-pwa) with offline fallback showing cached hours/contact; graceful "service waking up" state when Supabase is paused or offline.
8. **Tests & CI**: Vitest, Playwright (4 projects), axe, Lighthouse CI, pgTAP; workflows `ci.yml`, `db-test.yml`, `deploy.yml`, `lighthouse.yml`, `keepalive.yml`, `backup.yml` exactly as in requirements.md §7.
9. **Docs for a non-developer owner**: `docs/SETUP.md` (step-by-step with screenshots placeholders: create Supabase project, run migrations, set GitHub variables/secrets, make yourself admin with one SQL line, enable Pages), `docs/ADMIN_GUIDE.md` (daily use for staff, in simple English + Bangla), `docs/DEPLOY_CLOUDFLARE.md`, `docs/DECISIONS.md`.

## Quality bar
- Looks premium on a cheap Android phone: dark, calm, crisp type, subtle glow only where design.md says. No generic template look, no stock "gamer" clichés, no clutter.
- Every page has loading skeletons, empty states, error states, and works at 320 px.
- Bangla toggle covers 100% of UI strings; admin-entered content uses `_en`/`_bn` with fallback.
- Accessible: keyboard, focus rings, labels, contrast AA, reduced motion.

## Definition of done
- `npm run lint`, `npm run typecheck`, `npm run test`, `supabase test db`, `npm run test:e2e` all pass locally and in GitHub Actions.
- Every MUST requirement in `srs.md` maps to at least one passing test — produce `docs/TRACEABILITY.md` (requirement ID → test IDs → status).
- Lighthouse CI budgets pass on the deployed site.
- `grep` finds no service-role key or secrets in `src/` or `dist/`.
- Final message to me: live URL (or exact steps left for me), what's placeholder vs real, any decision you made in `DECISIONS.md`, and the 3 things I should check by hand first.

Start with phase 1 now. Work autonomously through all phases; only pause if you need an account credential or a choice that costs money.
