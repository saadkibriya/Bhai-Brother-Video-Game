# Owner Setup Guide — Bhai Brother Video Game

This guide explains how to set up your free GitHub repository and Supabase database at **৳0/month** total cost.

---

## 1. Push to your GitHub Repository

Run these 3 commands in your terminal to push this exact codebase to your GitHub account:

```bash
git init
git add .
git commit -m "feat: complete Bhai Brother Video Game website"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/bhai-brother-video-game.git
git push -u origin main
```

### Enable GitHub Pages:
1. In your GitHub repository, click **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Any push to `main` will now automatically build and publish your site at `https://<YOUR_GITHUB_USERNAME>.github.io/bhai-brother-video-game/`.

---

## 2. Set Up Supabase (Free Database & Login)

1. Create a free account at [supabase.com](https://supabase.com).
2. Click **New Project**:
   - Name: `bhai-brother-game`
   - Database Password: *(Save this safely)*
   - Region: **Singapore (ap-southeast-1)** (Closest to Bangladesh)
3. Under **Authentication** → **Providers** → **Email**:
   - Ensure Email provider is **Enabled**.
   - **Turn OFF "Confirm email"** (Because users sign in with their phone number using synthetic email!).
4. Run Database Migrations:
   - Go to **SQL Editor** in your Supabase Dashboard.
   - Copy and paste the contents of `supabase/migrations/0001_schema.sql` and run it.
   - Copy and paste `supabase/migrations/0002_rls.sql` and run it.
   - Copy and paste `supabase/migrations/0003_functions.sql` and run it.
   - Copy and paste `supabase/seed.sql` and run it.
5. Get your API Keys:
   - Go to **Project Settings** → **API**.
   - Copy the **Project URL** (`https://xyz.supabase.co`) and **anon public key**.
   - Add them to GitHub under **Settings** → **Secrets and variables** → **Actions** as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 3. Promote yourself to Admin

Run this single SQL command in Supabase SQL editor replacing `8801700000000` with your phone number:

```sql
update public.profiles
set role = 'admin'
where phone = '8801700000000';
```
You now have full admin and staff access to manage stations, games, and bookings!
