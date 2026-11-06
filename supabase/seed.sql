-- ============================================================================
-- Seed Data: Bhai Brother Video Game
-- Green City Residential, Block C, Dhaka Uddan, Mohammadpur, Dhaka
-- ============================================================================

-- 1. Shop Settings
insert into shop_settings (
  id, name_en, name_bn, tagline_en, tagline_bn,
  address_en, address_bn, phones, whatsapp,
  facebook_url, map_link, map_embed_url, lat, lng,
  booking_lead_minutes, booking_horizon_days, max_open_bookings,
  cancel_cutoff_minutes, max_players_per_station, price_rounding, booking_code_prefix
) values (
  1,
  'Bhai Brother Video Game',
  'ভাই ব্রাদার ভিডিও গেম',
  'PS5 · PS4 · Arcade — play with your squad',
  'পিএস৫ · পিএস৪ · আর্কেড — স্কোয়াড নিয়ে আসো',
  'Beside Sporsho Beauty Buzz, Green City Residential, Block C, Dhaka Uddan, Mohammadpur, Dhaka-1354',
  'স্পর্শ বিউটি বাজ এর পাশে, গ্রিন সিটি আবাসিক, ব্লক সি, ঢাকা উদ্যান, মোহাম্মদপুর, ঢাকা-১৩৫৪',
  array['01775-533852'],
  '8801775533852',
  'https://facebook.com/bhaibrothervideogame',
  'https://maps.app.goo.gl/dF6cr5AkT2A1JDFQ6',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d912.8!2d90.3371311!3d23.7584635!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755bf0030a6a8f9%3A0x59c47b55d14e0920!2sSporsho%20Beauty%20Buzz!5e0!3m2!1sen!2sbd!4v1730900000000!5m2!1sen!2sbd',
  23.7584635,
  90.3371311,
  15,
  14,
  2,
  60,
  4,
  5,
  'BB-'
) on conflict (id) do nothing;

-- 2. Opening Hours
insert into opening_hours (weekday, open_time, close_time, is_closed) values
  (6, '14:00', '23:00', false), -- Saturday
  (0, '14:00', '23:00', false), -- Sunday
  (1, '14:00', '23:00', false), -- Monday
  (2, '14:00', '23:00', false), -- Tuesday
  (3, '14:00', '23:00', false), -- Wednesday
  (4, '14:00', '01:00', false), -- Thursday (late night)
  (5, '15:00', '00:00', false)  -- Friday (after Jumu'ah till midnight)
on conflict (weekday) do update set
  open_time = excluded.open_time,
  close_time = excluded.close_time,
  is_closed = excluded.is_closed;

-- 3. Stations (1 PS5 and 1 PS4)
insert into stations (name, platform, status, sort) values
  ('PS5 #1 (4K HDR)', 'ps5', 'free', 1),
  ('PS4 #1 (Pro)', 'ps4', 'free', 2);

-- 4. Pricing Rules (PS5 70 BDT 1P/140 BDT 2P, PS4 50 BDT 1P/100 BDT 2P)
insert into pricing_rules (platform, hourly_bdt, extra_player_hourly_bdt, min_minutes, increment_minutes) values
  ('ps5', 70, 70, 30, 30),
  ('ps4', 50, 50, 30, 30)
on conflict (platform) do update set
  hourly_bdt = excluded.hourly_bdt,
  extra_player_hourly_bdt = excluded.extra_player_hourly_bdt,
  min_minutes = excluded.min_minutes;

-- 5. Arcade Rates & Machines (1 Arcade)
insert into arcade_rates (coins, price_bdt, is_base) values
  (3, 10, true),
  (6, 20, false),
  (10, 30, false);

insert into arcade_machines (name, coins_per_play) values
  ('Tekken Arcade Cabinet', 1);

-- 6. Games Catalogue
insert into games (title, slug, platforms, genres, max_players, tags, is_featured, sort) values
  ('EA SPORTS FC 26', 'fc-26', array['ps5','ps4']::platform[], array['Sports','Football'], 4, array['Popular','Multiplayer'], true, 1),
  ('Tekken 8', 'tekken-8', array['ps5']::platform[], array['Fighting'], 2, array['Popular','New'], true, 2),
  ('Mortal Kombat 1', 'mk-1', array['ps5']::platform[], array['Fighting'], 2, array['Popular'], true, 3),
  ('GTA V', 'gta-v', array['ps5','ps4']::platform[], array['Action','Open World'], 1, array['Popular'], true, 4),
  ('Call of Duty: Modern Warfare III', 'cod-mw3', array['ps5','ps4']::platform[], array['Shooter','Action'], 2, array['Popular'], true, 5),
  ('WWE 2K24', 'wwe-2k24', array['ps5','ps4']::platform[], array['Sports','Wrestling'], 4, array['Multiplayer'], true, 6),
  ('Cricket 24', 'cricket-24', array['ps5','ps4']::platform[], array['Sports','Cricket'], 2, array['Popular'], false, 7),
  ('Need for Speed Unbound', 'nfs-unbound', array['ps5']::platform[], array['Racing'], 2, array['Multiplayer'], false, 8),
  ('Marvel''s Spider-Man 2', 'spiderman-2', array['ps5']::platform[], array['Action','Adventure'], 1, array['New'], false, 9),
  ('Naruto x Boruto Storm Connections', 'naruto-storm', array['ps5','ps4']::platform[], array['Fighting','Anime'], 2, array['Popular'], false, 10);

-- 7. Announcements
insert into announcements (title_en, title_bn, body_en, body_bn, is_active) values
  (
    'Weekend FC 26 1v1 Tournament',
    'উইকেন্ড এফসি ২৬ ১ বনাম ১ টুর্নামেন্ট',
    'Registration open! Champion takes ৳২,০০০ cash + 5 hours free PS5 game time. Talk to counter or book online.',
    'রেজিস্ট্রেশন চলছে! চ্যাম্পিয়ন পাবে ২,০০০ টাকা ক্যাশ প্রাইজ ও ৫ ঘণ্টা ফ্রি পিএস৫ গেমিং। কাউন্টারে যোগাযোগ করুন।',
    true
  );

-- 8. FAQs & House Rules
insert into faqs (kind, q_en, q_bn, a_en, a_bn, sort) values
  (
    'faq',
    'Can I play with my own squad (3-4 players)?',
    'আমরা কি ৩-৪ জন বন্ধু একসাথে খেলতে পারব?',
    'Yes! All PS5 & PS4 stations support up to 4 wireless controllers for multiplayer games like FC 26, WWE 2K, etc.',
    'হ্যাঁ! আমাদের প্রতিটি পিএস৫ ও পিএস৪ স্টেশনে ৪টি কন্ট্রোলার দিয়ে ফিফা, ডাব্লিউডাব্লিউই সহ অন্যান্য গেম খেলা যায়।',
    1
  ),
  (
    'faq',
    'What is the arcade token rate?',
    'আর্কেড টোকেনের রেট কত?',
    'Arcade tokens are 3 coins for ৳10. Special pack: 10 coins for ৳30.',
    'আর্কেড টোকেন ৩ টি কয়েন মাত্র ১০ টাকায় পাওয়া যায়। ১০টি কয়েনের স্পেশাল প্যাক ৩০ টাকা।',
    2
  ),
  (
    'rule',
    'Controller Care & Sportsmanship',
    'কন্ট্রোলারের যত্ন ও সুন্দর আচরণ',
    'Please handle DualSense and DualShock controllers with care. Aggressive banging, throwing, or misuse is strictly prohibited.',
    'দয়া করে জয়স্টিক ও কন্ট্রোলার সাবধানে ব্যবহার করবেন। কোনো প্রকার আছাড় বা ক্ষতির ক্ষেত্রে জরিমানা প্রযোজ্য।',
    3
  ),
  (
    'rule',
    'No Smoking & Clean Gaming Zone',
    'ধূমপানমুক্ত ও পরিচ্ছন্ন পরিবেশ',
    'Smoking or consumption of messy outside food around console tables is strictly prohibited to keep equipment clean.',
    'গেমিং জোনের ভিতরে ধূমপান সম্পূর্ণ নিষিদ্ধ। খাবারের উচ্ছিষ্টাংশ টেবিলে ফেলবেন না।',
    4
  );
