# Requirements Traceability Matrix (SRS → Implementation)

| Req ID | Description | Implementation File / Component | Status |
|---|---|---|---|
| **FR-HRS-01** | Live open/closed badge in Asia/Dhaka time | `src/lib/hours.ts`, `src/components/OpenBadge.tsx` | Complete |
| **FR-HRS-02** | Weekly opening hours & past-midnight close | `src/lib/hours.ts`, `src/pages/ContactPage.tsx` | Complete |
| **FR-HRS-03** | Special-date overrides (Eid, holidays) | `src/lib/hours.ts`, `src/lib/store.ts` | Complete |
| **FR-CON-01** | Contact block, landmark beside Sporsho Beauty Buzz, Google Map | `src/pages/ContactPage.tsx`, `src/pages/HomePage.tsx` | Complete |
| **FR-CON-02** | Floating WhatsApp & Call button on mobile | `src/components/FloatingActions.tsx` | Complete |
| **FR-GAM-01** | Games catalogue with platforms, players, genres, tags | `src/lib/store.ts`, `src/pages/GamesPage.tsx` | Complete |
| **FR-GAM-02** | Instant search and filtering | `src/pages/GamesPage.tsx` | Complete |
| **FR-GAM-03** | Generated cover cards per Midnight Arena design | `src/components/GameCard.tsx` | Complete |
| **FR-PRC-01** | Hourly pricing rules per platform (PS5 ৳120, PS4 ৳80) | `src/lib/pricing.ts`, `src/pages/PricingPage.tsx` | Complete |
| **FR-PRC-03** | Arcade token base rate (3 coins = ৳10) and packs | `src/lib/pricing.ts`, `src/components/PriceCalculator.tsx` | Complete |
| **FR-PRC-04** | Interactive price calculator with breakdown | `src/components/PriceCalculator.tsx` | Complete |
| **FR-PRC-05** | Pure pricing algorithm unit-tested | `src/lib/pricing.ts` | Complete |
| **FR-STN-01** | Stations (PS5 #1..#4, PS4 #1..#6) with status | `src/lib/store.ts`, `src/components/StationBoard.tsx` | Complete |
| **FR-STN-02** | Realtime live availability board | `src/components/StationBoard.tsx` | Complete |
| **FR-STN-03** | Staff one-tap station status toggle | `src/components/StationBoard.tsx`, `src/pages/AdminPage.tsx` | Complete |
| **FR-ACC-01** | Register with name, Bangladeshi mobile, password | `src/pages/RegisterPage.tsx` | Complete |
| **FR-ACC-02** | Phone validation and normalization | `src/lib/phone.ts` | Complete |
| **FR-ACC-03** | Synthetic email generation for zero-cost auth | `src/lib/phone.ts` | Complete |
| **FR-ACC-06** | Profile page with stats, tier, history, cancel | `src/pages/ProfilePage.tsx` | Complete |
| **FR-BKG-01** | Booking wizard with console, date, time slot | `src/pages/BookPage.tsx` | Complete |
| **FR-BKG-04** | Cancellation cutoff rules | `src/lib/store.ts`, `src/pages/ProfilePage.tsx` | Complete |
| **FR-BKG-05** | Booking success screen with reference code & WhatsApp link | `src/pages/BookPage.tsx` | Complete |
| **FR-LDB-01** | Leaderboard ranked by completed sessions | `src/pages/LeaderboardPage.tsx` | Complete |
| **FR-LDB-03** | Tiers: Rookie 0, Bronze 5, Silver 15, Gold 30, Platinum 60, Diamond 100 | `src/lib/tiers.ts` | Complete |
| **FR-LDB-04** | Privacy-safe display names ("Rafi ••• 482" or nickname) | `src/lib/displayName.ts` | Complete |
| **FR-ADM-01** | Admin operations portal | `src/pages/AdminPage.tsx` | Complete |
| **FR-ADM-05** | CSV export of bookings | `src/pages/AdminPage.tsx` | Complete |
| **FR-I18N-01**| English / বাংলা bilingual toggle | `src/i18n/translations.ts`, `src/components/Header.tsx` | Complete |
| **FR-PWA-01** | Installable PWA with cross-platform in-app button | `src/components/PWAInstallButton.tsx` | Complete |
| **FR-SEO-01** | LocalBusiness JSON-LD, sitemap, robots, OpenGraph | `index.html`, `public/robots.txt`, `public/sitemap.xml` | Complete |
