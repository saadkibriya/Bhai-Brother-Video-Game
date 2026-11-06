# Key Architecture Decisions — Bhai Brother Video Game

### 1. Cost Target: ৳0/month
- **Decision:** Use GitHub Pages / Cloudflare Pages for static hosting, Supabase Free Tier for database and auth, and client-side calculations.
- **Why:** Avoids monthly server costs, recurring billing, or SMS API charges.
- **WhatsApp Direct Action:** Instead of expensive SMS gateways (which charge per message in Bangladesh), we generate instant pre-filled WhatsApp links with booking reference codes.

### 2. Timezone: Asia/Dhaka (UTC+6)
- **Decision:** All timestamps stored in UTC (`timestamptz`), but display and open/close status logic runs in `Asia/Dhaka` regardless of the visitor's local system timezone.
- **Why:** Ensures customers traveling or using VPNs always see correct Dhaka shop hours.

### 3. Login via Synthetic Email
- **Decision:** Customers log in using their Bangladeshi phone number (`01XXXXXXXXX`) and password. Internally, Supabase Auth uses a synthetic email: `<phone>@members.bhaibrother.app`.
- **Why:** Removes the need for email verification or paid SMS OTP providers while keeping Supabase Auth secure.

### 4. Router Dual-Mode
- **Decision:** Supports both `HashRouter` (when `VITE_DEPLOY_TARGET=github` for GitHub Pages to avoid 404s on page refresh) and `BrowserRouter` (when deployed to Cloudflare Pages).
- **Why:** Seamless deployment across both platforms with zero manual code changes.

### 5. Local-First Fallback
- **Decision:** The application includes a self-contained local-first reactive store pre-loaded with all seed stations, games, and prices, and persists changes to `localStorage`.
- **Why:** Allows instant previewing, testing, booking, and administrative control in development, while transparently syncing with Supabase when credentials are configured.
