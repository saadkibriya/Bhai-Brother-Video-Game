# Cloudflare Pages 5-Minute Deploy Guide

If you prefer clean URLs (`bhaibrother.pages.dev/games` instead of `bhaibrother.pages.dev/#/games`) and want to deploy to Cloudflare Pages for free:

1. Sign up for a free account at [cloudflare.com](https://cloudflare.com).
2. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select your GitHub repository `bhai-brother-video-game`.
4. Configure Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variables:
     - `VITE_DEPLOY_TARGET`: `cloudflare`
     - `VITE_SUPABASE_URL`: *(Your Supabase URL)*
     - `VITE_SUPABASE_ANON_KEY`: *(Your Supabase Anon Key)*
5. Click **Save and Deploy**.

Cloudflare Pages will build and deploy your site with global edge caching and free SSL.
