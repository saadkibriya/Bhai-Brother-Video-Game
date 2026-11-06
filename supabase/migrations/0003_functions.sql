-- ============================================================================
-- Migration 0003: Postgres Functions & Triggers
-- Security Definer RPCs for Bookings, Leaderboard, and Auth Sync
-- ============================================================================

-- 1. Keep-alive ping function
create or replace function public.ping()
returns boolean language sql security definer as $$
  select true;
$$;

-- 2. Auth Trigger: Create profile on auth.users signup and link past walk-ins
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  raw_phone text;
  norm_phone text;
  user_full_name text;
  user_nickname text;
begin
  raw_phone := new.raw_user_meta_data->>'phone';
  user_full_name := coalesce(new.raw_user_meta_data->>'full_name', 'Gamer');
  user_nickname := new.raw_user_meta_data->>'nickname';

  if raw_phone is null then
    raw_phone := split_part(new.email, '@', 1);
  end if;

  norm_phone := regexp_replace(raw_phone, '\D', '', 'g');

  insert into public.profiles (id, full_name, nickname, phone, contact_email, role)
  values (
    new.id,
    user_full_name,
    nullif(trim(user_nickname), ''),
    norm_phone,
    new.raw_user_meta_data->>'contact_email',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'member'::user_role)
  )
  on conflict (id) do nothing;

  -- Link past walk-in bookings that used this phone number
  update public.bookings
  set member_id = new.id
  where guest_phone = norm_phone and member_id is null;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Leaderboard RPCs (Privacy safe: no phone, no email, no user uuid)
create or replace function public.leaderboard_all()
returns table (
  rank int,
  display_name text,
  tier text,
  sessions_completed bigint,
  total_minutes bigint
) language sql security definer set search_path = public as $$
  with stats as (
    select
      p.id,
      coalesce(
        nullif(trim(p.nickname), ''),
        split_part(trim(p.full_name), ' ', 1) || ' ••• ' || right(p.phone, 3)
      ) as display_name,
      count(b.id) as sessions_completed,
      coalesce(sum(coalesce(b.actual_minutes, extract(epoch from (b.end_at - b.start_at))/60)::bigint), 0) as total_minutes
    from profiles p
    left join bookings b on b.member_id = p.id and b.status = 'completed'
    where p.is_banned = false
    group by p.id, p.nickname, p.full_name, p.phone
  )
  select
    row_number() over (order by sessions_completed desc, total_minutes desc, id asc)::int as rank,
    display_name,
    case
      when sessions_completed >= 100 then 'Diamond'
      when sessions_completed >= 60 then 'Platinum'
      when sessions_completed >= 30 then 'Gold'
      when sessions_completed >= 15 then 'Silver'
      when sessions_completed >= 5 then 'Bronze'
      else 'Rookie'
    end as tier,
    sessions_completed,
    total_minutes
  from stats
  order by rank asc
  limit 50;
$$;

-- 4. Create Booking RPC with capacity check & advisory locking
create or replace function public.create_booking(
  p_platform platform,
  p_start timestamptz,
  p_minutes int,
  p_players int default 1,
  p_game uuid default null,
  p_note text default null
)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_end timestamptz;
  v_open_count int;
  v_station_capacity int;
  v_overlapping int;
  v_code text;
  v_price int;
  v_hourly int;
  v_extra_hourly int;
  v_rounding int;
  v_result bookings%rowtype;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  -- Check if user is banned
  if exists (select 1 from profiles where id = v_user_id and is_banned = true) then
    raise exception 'Account is suspended';
  end if;

  -- Platform restriction
  if p_platform = 'arcade' then
    raise exception 'Arcade machines are coin-operated and walk-in only';
  end if;

  -- Timing validation
  if p_start < (now() + interval '15 minutes') then
    raise exception 'Booking start time must be at least 15 minutes in advance';
  end if;

  if p_start > (now() + interval '14 days') then
    raise exception 'Bookings can only be made up to 14 days in advance';
  end if;

  if p_minutes < 30 or p_minutes > 360 or (p_minutes % 30 != 0) then
    raise exception 'Invalid duration: must be between 30 and 360 minutes in 30-min increments';
  end if;

  v_end := p_start + (p_minutes || ' minutes')::interval;

  -- Check open bookings count limit (max 2)
  select count(*) into v_open_count
  from bookings
  where member_id = v_user_id
    and status in ('pending', 'confirmed')
    and end_at > now();

  if v_open_count >= 2 then
    raise exception 'You already have 2 active bookings pending or confirmed';
  end if;

  -- Acquire advisory lock per platform
  perform pg_advisory_xact_lock(hashtext(p_platform::text));

  -- Available non-maintenance stations
  select count(*) into v_station_capacity
  from stations
  where platform = p_platform and is_active = true and status != 'maintenance';

  if v_station_capacity <= 0 then
    raise exception 'No active stations for % currently', p_platform;
  end if;

  -- Overlapping bookings
  select count(*) into v_overlapping
  from bookings
  where platform = p_platform
    and status in ('pending', 'confirmed')
    and (start_at, end_at) overlaps (p_start, v_end);

  if v_overlapping >= v_station_capacity then
    raise exception 'Slot is fully booked for %. Please choose another time.', p_platform;
  end if;

  -- Calculate estimated price
  select hourly_bdt, extra_player_hourly_bdt into v_hourly, v_extra_hourly
  from pricing_rules where platform = p_platform;

  select price_rounding into v_rounding from shop_settings where id = 1;

  v_hourly := coalesce(v_hourly, case when p_platform = 'ps5' then 120 else 80 end);
  v_extra_hourly := coalesce(v_extra_hourly, 0);
  v_rounding := coalesce(v_rounding, 5);

  v_price := (v_hourly * p_minutes / 60) + (v_extra_hourly * greatest(p_players - 1, 0) * p_minutes / 60);
  if v_rounding > 1 then
    v_price := ceil(v_price::numeric / v_rounding) * v_rounding;
  end if;

  -- Generate unique code
  v_code := 'BB-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));

  insert into bookings (
    code,
    member_id,
    platform,
    game_id,
    start_at,
    end_at,
    players,
    estimated_bdt,
    note,
    status,
    created_by
  ) values (
    v_code,
    v_user_id,
    p_platform,
    p_game,
    p_start,
    v_end,
    p_players,
    v_price,
    p_note,
    'pending',
    v_user_id
  ) returning * into v_result;

  return to_jsonb(v_result);
end;
$$;

-- 5. Cancel Own Booking RPC
create or replace function public.cancel_my_booking(p_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_start timestamptz;
  v_cutoff int;
begin
  select cancel_cutoff_minutes into v_cutoff from shop_settings where id = 1;
  v_cutoff := coalesce(v_cutoff, 60);

  select start_at into v_start
  from bookings
  where id = p_id and member_id = auth.uid() and status in ('pending', 'confirmed');

  if not found then
    raise exception 'Booking not found or not in cancellable state';
  end if;

  if v_start < (now() + (v_cutoff || ' minutes')::interval) then
    raise exception 'Bookings cannot be cancelled less than % minutes before start', v_cutoff;
  end if;

  update bookings
  set status = 'cancelled', cancel_reason = 'Cancelled by member', updated_at = now()
  where id = p_id;

  return true;
end;
$$;
