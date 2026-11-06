-- ============================================================================
-- Migration 0001: Schema Definition
-- Bhai Brother Video Game (PS5, PS4 & Arcade Lounge)
-- ============================================================================

-- Create Enums
create type platform as enum ('ps4', 'ps5', 'arcade');
create type station_status as enum ('free', 'busy', 'maintenance');
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
create type user_role as enum ('member', 'staff', 'admin');

-- 1. Shop Settings (Single row id=1)
create table if not exists shop_settings (
  id int primary key default 1 check (id = 1),
  name_en text not null default 'Bhai Brother Video Game',
  name_bn text not null default 'ভাই ব্রাদার ভিডিও গেম',
  tagline_en text not null default 'PS5 · PS4 · Arcade — play with your squad',
  tagline_bn text not null default 'পিএস৫ · পিএস৪ · আর্কেড — স্কোয়াড নিয়ে আসো',
  address_en text not null default 'Beside Sporsho Beauty Buzz, Green City Residential, Block C, Dhaka Uddan, Mohammadpur, Dhaka-1354',
  address_bn text not null default 'স্পর্শ বিউটি বাজ এর পাশে, গ্রিন সিটি আবাসিক, ব্লক সি, ঢাকা উদ্যান, মোহাম্মদপুর, ঢাকা-১৩৫৪',
  phones text[] not null default array['01700-000000'],
  whatsapp text not null default '8801700000000',
  facebook_url text default 'https://facebook.com',
  instagram_url text default '',
  map_link text default 'https://maps.app.goo.gl/dF6cr5AkT2A1JDFQ6',
  map_embed_url text default 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d912.8!2d90.3371311!3d23.7584635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf0030a6a8f9%3A0x59c47b55d14e0920!2sSporsho%20Beauty%20Buzz!5e0!3m2!1sen!2sbd!4v1730900000000!5m2!1sen!2sbd',
  lat numeric(10, 7) default 23.7584635,
  lng numeric(10, 7) default 90.3371311,
  booking_lead_minutes int default 15,
  booking_horizon_days int default 14,
  max_open_bookings int default 2,
  cancel_cutoff_minutes int default 60,
  max_players_per_station int default 4,
  rank_counts text default 'completed',
  price_rounding int default 5,
  booking_code_prefix text default 'BB-',
  tier_thresholds jsonb default '{"Rookie":0,"Bronze":5,"Silver":15,"Gold":30,"Platinum":60,"Diamond":100}'::jsonb,
  tier_perks jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 2. Opening Hours (0=Sunday ... 6=Saturday)
create table if not exists opening_hours (
  weekday int primary key check (weekday between 0 and 6),
  open_time time not null,
  close_time time not null,
  is_closed boolean default false
);

-- 3. Special Hours Overrides
create table if not exists special_hours (
  date date primary key,
  open_time time,
  close_time time,
  is_closed boolean default false,
  note_en text,
  note_bn text
);

-- 4. Stations
create table if not exists stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  platform platform not null,
  status station_status not null default 'free',
  is_active boolean default true,
  sort int default 0,
  updated_at timestamptz default now(),
  updated_by uuid
);

-- 5. Games
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  platforms platform[] not null,
  genres text[] not null default array[]::text[],
  max_players int not null default 2,
  tags text[] default array[]::text[],
  image_url text,
  description_en text,
  description_bn text,
  is_featured boolean default false,
  sort int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 6. Pricing Rules
create table if not exists pricing_rules (
  platform platform primary key,
  hourly_bdt int not null,
  extra_player_hourly_bdt int not null default 0,
  min_minutes int not null default 30,
  increment_minutes int not null default 30
);

-- 7. Pricing Packages
create table if not exists pricing_packages (
  id uuid primary key default gen_random_uuid(),
  platform platform not null,
  label_en text not null,
  label_bn text not null,
  minutes int not null,
  price_bdt int not null,
  weekdays int[],
  start_time time,
  end_time time,
  is_active boolean default true
);

-- 8. Arcade Rates & Machines
create table if not exists arcade_rates (
  id uuid primary key default gen_random_uuid(),
  coins int not null,
  price_bdt int not null,
  is_base boolean default false
);

create table if not exists arcade_machines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  coins_per_play int not null default 1,
  image_url text,
  is_active boolean default true
);

-- 9. Member Profiles (links to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  nickname text unique,
  phone text unique not null,
  contact_email text,
  role user_role not null default 'member',
  is_banned boolean not null default false,
  created_at timestamptz default now()
);

-- 10. Bookings
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  member_id uuid references profiles(id) on delete set null,
  guest_name text,
  guest_phone text,
  platform platform not null,
  stations_count int not null default 1,
  station_id uuid references stations(id) on delete set null,
  game_id uuid references games(id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  players int not null default 1,
  estimated_bdt int not null,
  actual_minutes int,
  note text,
  status booking_status not null default 'pending',
  cancel_reason text,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_bookings_capacity on bookings (platform, start_at, end_at)
where status in ('pending', 'confirmed');

-- 11. Announcements & Events
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_bn text,
  body_en text not null,
  body_bn text,
  image_url text,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  is_active boolean default true
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_bn text,
  game_id uuid references games(id),
  platform platform not null,
  starts_at timestamptz not null,
  entry_fee_bdt int not null default 0,
  prize_en text,
  prize_bn text,
  max_slots int not null default 16,
  status text not null default 'upcoming',
  is_active boolean default true
);

create table if not exists event_interests (
  event_id uuid references events(id) on delete cascade,
  member_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (event_id, member_id)
);

-- 12. FAQ & House Rules
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('faq', 'rule')),
  q_en text not null,
  q_bn text,
  a_en text not null,
  a_bn text,
  sort int default 0
);

-- 13. Audit Log
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor uuid,
  action text not null,
  entity text not null,
  entity_id text,
  diff jsonb,
  at timestamptz default now()
);
