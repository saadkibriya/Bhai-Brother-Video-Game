-- ============================================================================
-- Migration 0002: Row-Level Security (RLS)
-- Default Deny, Role-Based Access Control
-- ============================================================================

-- Helper functions
create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role in ('staff', 'admin')
      and is_banned = false
  );
$$;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role = 'admin'
      and is_banned = false
  );
$$;

-- Enable RLS on ALL tables
alter table shop_settings enable row level security;
alter table opening_hours enable row level security;
alter table special_hours enable row level security;
alter table stations enable row level security;
alter table games enable row level security;
alter table pricing_rules enable row level security;
alter table pricing_packages enable row level security;
alter table arcade_rates enable row level security;
alter table arcade_machines enable row level security;
alter table profiles enable row level security;
alter table bookings enable row level security;
alter table announcements enable row level security;
alter table events enable row level security;
alter table event_interests enable row level security;
alter table faqs enable row level security;
alter table audit_log enable row level security;

-- 1. Public Readable Tables
create policy "Public can view settings" on shop_settings for select using (true);
create policy "Admin can edit settings" on shop_settings for all using (is_admin());

create policy "Public can view hours" on opening_hours for select using (true);
create policy "Admin can edit hours" on opening_hours for all using (is_admin());

create policy "Public can view special hours" on special_hours for select using (true);
create policy "Admin can edit special hours" on special_hours for all using (is_admin());

create policy "Public can view active stations" on stations for select using (true);
create policy "Staff can update stations" on stations for update using (is_staff());
create policy "Admin can manage stations" on stations for all using (is_admin());

create policy "Public can view active games" on games for select using (is_active = true or is_staff());
create policy "Admin can manage games" on games for all using (is_admin());

create policy "Public can view pricing rules" on pricing_rules for select using (true);
create policy "Admin can manage pricing rules" on pricing_rules for all using (is_admin());

create policy "Public can view pricing packages" on pricing_packages for select using (is_active = true or is_staff());
create policy "Admin can manage pricing packages" on pricing_packages for all using (is_admin());

create policy "Public can view arcade rates" on arcade_rates for select using (true);
create policy "Admin can manage arcade rates" on arcade_rates for all using (is_admin());

create policy "Public can view arcade machines" on arcade_machines for select using (is_active = true or is_staff());
create policy "Admin can manage arcade machines" on arcade_machines for all using (is_admin());

create policy "Public can view announcements" on announcements for select using (is_active = true or is_staff());
create policy "Admin can manage announcements" on announcements for all using (is_admin());

create policy "Public can view events" on events for select using (is_active = true or is_staff());
create policy "Admin can manage events" on events for all using (is_admin());

create policy "Public can view faqs" on faqs for select using (true);
create policy "Admin can manage faqs" on faqs for all using (is_admin());

-- 2. Profiles Table:
-- Members see only their own row. Staff can see all rows (for lookup / bans).
create policy "Users see own profile" on profiles for select using (auth.uid() = id or is_staff());
create policy "Users can update own details" on profiles for update using (auth.uid() = id)
with check (
  auth.uid() = id
  -- Prevents self-promotion or self-unbanning:
  and role = (select role from profiles where id = auth.uid())
  and is_banned = (select is_banned from profiles where id = auth.uid())
);
create policy "Staff can update member bans" on profiles for update using (is_staff());
create policy "Admin can manage all profiles" on profiles for all using (is_admin());

-- 3. Bookings Table:
-- Direct INSERT is denied to normal members (must use create_booking() security definer RPC).
-- Members can select their own bookings. Staff can select and update all.
create policy "Members see own bookings" on bookings for select using (member_id = auth.uid() or is_staff());
create policy "Staff can manage bookings" on bookings for all using (is_staff());

-- 4. Event Interests:
create policy "Members see own event interest" on event_interests for select using (member_id = auth.uid() or is_staff());
create policy "Members manage own event interest" on event_interests for all using (member_id = auth.uid());

-- 5. Audit Log:
create policy "Staff can view audit log" on audit_log for select using (is_staff());
create policy "System can insert audit log" on audit_log for insert with check (true);
