import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone, MapPin, Trophy, ShieldCheck, Flame, Sparkles, Monitor, Wifi, Wind } from 'lucide-react';
import { useStore } from '../lib/store';
import { OpenBadge } from '../components/OpenBadge';
import { StationBoard } from '../components/StationBoard';
import { GameCard } from '../components/GameCard';
import { PriceCalculator } from '../components/PriceCalculator';
import { translations } from '../i18n/translations';
import { formatBdt } from '../lib/format';
import { getSafeDisplayName } from '../lib/displayName';
import { TIERS } from '../lib/tiers';
import loungeInterior from '../assets/images/shop_lounge_interior_1793937075076.jpg';

export const HomePage: React.FC = () => {
  const { settings, games, announcements, allMembers, lang } = useStore();
  const t = translations[lang];

  const featuredGames = games.filter((g) => g.isFeatured).slice(0, 4);
  const activeAnnouncement = announcements.find((a) => a.isActive);

  // Top 5 members for leaderboard preview
  const topMembers = [...allMembers]
    .sort((a, b) => b.sessionsCompleted - a.sessionsCompleted)
    .slice(0, 5);

  const primaryPhone = settings.phones[0] || '01775-533852';
  const cleanPhone = primaryPhone.replace(/[\s\-()]/g, '');

  return (
    <div className="min-h-screen">
      {/* Active Tournament / Announcement Banner */}
      {activeAnnouncement && (
        <div className="border-b border-[#4F7CFF]/30 bg-gradient-to-r from-[#4F7CFF]/15 via-[#8B6CFF]/15 to-[#4F7CFF]/15 px-4 py-2.5 text-xs text-slate-900 dark:text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-5 items-center gap-1 rounded bg-[#4F7CFF] px-1.5 text-[10px] font-bold uppercase text-white">
                <Flame className="h-3 w-3" />
                <span>Notice</span>
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                {lang === 'bn' ? activeAnnouncement.titleBn : activeAnnouncement.titleEn}
              </span>
            </div>
            <Link to="/book" className="hidden sm:inline-flex items-center gap-1 font-bold text-[#4F7CFF] hover:underline shrink-0">
              <span>{lang === 'bn' ? 'স্লট বুক করুন' : 'Book Now'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden hero-grid pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 dark:border-[#23273A]/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Location Landmark Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#4F7CFF]/30 bg-[#4F7CFF]/10 px-3.5 py-1 text-xs font-semibold text-[#4F7CFF]">
                <MapPin className="h-3.5 w-3.5" />
                <span>{lang === 'bn' ? 'স্পর্শ বিউটি বাজ এর পাশে, গ্রিন সিটি ব্লক সি' : 'Beside Sporsho Beauty Buzz · Green City Block C'}</span>
              </div>

              {/* Display Headline in Sora font */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
                {lang === 'bn' ? settings.nameBn : settings.nameEn}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {lang === 'bn' ? t.heroSubtitle : settings.taglineEn}
              </p>

              {/* Status and Action CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <OpenBadge />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'শনি–বুধ দুপুর ২টা–রাত ১১টা · বৃহস্পতি রাত ১টা পর্যন্ত' : 'Sat–Wed 2 PM–11 PM · Thu till 1 AM'}
                </span>
              </div>

              {/* Early Arrival Policy Badge */}
              <div className="rounded-xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3.5 py-1.5 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2 w-fit">
                <span className="font-bold">⏰ {lang === 'bn' ? 'উপস্থিতির নিয়ম:' : 'Arrival Buffer:'}</span>
                <span>
                  {lang === 'bn'
                    ? 'স্লট নিশ্চিত করতে ১০–২০ মিনিট পূর্বে শপে উপস্থিত থাকুন'
                    : 'Must arrive 10–20 mins early to secure booked station'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/book"
                  className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#4F7CFF]/30 hover:bg-[#3b68ee] transition active:scale-95"
                >
                  <span>{t.bookSlotBtn}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                    lang === 'bn' ? 'হ্যালো ভাই ব্রাদার ভিডিও গেম, আমি গেমিং স্লট বুক করতে চাই।' : 'Hello Bhai Brother Video Game, I would like to book a station.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 fill-current" />
                  <span>{t.whatsAppUs}</span>
                </a>

                <a
                  href={`tel:${cleanPhone}`}
                  className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#151826] px-4 py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition"
                >
                  <Phone className="h-4 w-4 text-[#4F7CFF]" />
                  <span>{primaryPhone}</span>
                </a>
              </div>
            </div>

            {/* Right Hero Column: Live Station Board Card */}
            <div className="lg:col-span-5">
              <StationBoard />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Gaming Lounge Showcase Banner */}
      <section className="relative overflow-hidden border-b border-slate-200 dark:border-[#23273A]/60 bg-white dark:bg-[#07080D] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-[#23273A] shadow-2xl">
            {/* Background Lounge Image */}
            <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
              <img
                src={loungeInterior}
                alt="Bhai Brother Video Game Lounge Interior"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
            </div>

            {/* Content overlay */}
            <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-between text-white">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#4F7CFF]/20 border border-[#4F7CFF]/40 px-3 py-1 text-xs font-bold text-[#8adeff] backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-[#4F7CFF]" />
                  <span>{lang === 'bn' ? 'প্রিমিয়াম গেমিং অ্যাম্বিয়েন্স' : 'Next-Gen Gaming Experience'}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  {lang === 'bn' ? 'ভাই ব্রাদার ভিডিও গেম লাউঞ্জ' : 'Step Inside the Bhai Brother Arena'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg">
                  {lang === 'bn'
                    ? 'হাই-স্পিড পিএস৫ এবং পিএস৪ সেটআপ, আরামদায়ক সোফা ও সিটিং, সার্বক্ষণিক এসি, লো-ল্যাটেন্সি 4K ডিসপ্লে এবং বন্ধুদের সাথে আসর জমানোর পারফেক্ট স্পট।'
                    : 'Equipped with 4K HDR displays, DualSense wireless controllers, full AC cooling, and multi-player couch setups for the ultimate Dhaka gaming session.'}
                </p>
              </div>

              {/* Feature badges row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15 max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                  <Monitor className="h-4 w-4 text-[#3DA9FC]" />
                  <span>4K HDR 120Hz</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                  <Wind className="h-4 w-4 text-[#2BD98A]" />
                  <span>Full Air Conditioned</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                  <Wifi className="h-4 w-4 text-[#FFB224]" />
                  <span>Fiber Optic Low Ping</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
                  <ShieldCheck className="h-4 w-4 text-[#8B6CFF]" />
                  <span>Clean & Friendly Zone</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-14 border-b border-slate-200 dark:border-[#23273A]/60 bg-white dark:bg-[#07080D] transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF]">
                {lang === 'bn' ? 'সাশ্রয়ী ভাড়ার তালিকা' : 'Zone Pricing'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {t.pricingTitle}
              </h2>
            </div>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F7CFF] hover:underline"
            >
              <span>{t.viewPricingBtn}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PS5 Card */}
            <div className="relative rounded-2xl border border-[#3DA9FC]/40 bg-slate-50 dark:bg-[#0E1018] p-6 shadow-xl transition-all duration-200 hover:border-[#3DA9FC] ps5-glow">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-md bg-[#3DA9FC]/20 px-2.5 py-1 text-xs font-bold text-[#1C7FD0] dark:text-[#3DA9FC] uppercase">
                  PlayStation 5
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">1 Station</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {formatBdt(70, lang)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.perHour} (1 Person)</span>
              </div>
              <div className="text-xs font-semibold text-[#1C7FD0] dark:text-[#3DA9FC] mb-4">
                2 Persons: {formatBdt(140, lang)} /hr
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#1C7FD0] dark:text-[#3DA9FC]" />
                  <span>4K HDR 60/120 FPS high performance setup</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#1C7FD0] dark:text-[#3DA9FC]" />
                  <span>DualSense wireless haptic controllers</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#1C7FD0] dark:text-[#3DA9FC]" />
                  <span>FC 26, Tekken 8, MK1, GTA V & CoD</span>
                </li>
              </ul>
              <Link
                to="/book?platform=ps5"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3DA9FC] py-2.5 text-xs font-bold text-slate-950 transition hover:bg-[#68c1ff]"
              >
                <span>Book PS5</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* PS4 Card */}
            <div className="relative rounded-2xl border border-[#8B6CFF]/40 bg-slate-50 dark:bg-[#0E1018] p-6 shadow-xl transition-all duration-200 hover:border-[#8B6CFF] ps4-glow">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-md bg-[#8B6CFF]/20 px-2.5 py-1 text-xs font-bold text-[#6A4BE0] dark:text-[#8B6CFF] uppercase">
                  PlayStation 4
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">1 Station</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {formatBdt(50, lang)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.perHour} (1 Person)</span>
              </div>
              <div className="text-xs font-semibold text-[#6A4BE0] dark:text-[#8B6CFF] mb-4">
                2 Persons: {formatBdt(100, lang)} /hr
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#6A4BE0] dark:text-[#8B6CFF]" />
                  <span>PS4 Pro console with low input latency</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#6A4BE0] dark:text-[#8B6CFF]" />
                  <span>DualShock 4 wireless controllers</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#6A4BE0] dark:text-[#8B6CFF]" />
                  <span>Full sports & fighting game library</span>
                </li>
              </ul>
              <Link
                to="/book?platform=ps4"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#8B6CFF] py-2.5 text-xs font-bold text-white transition hover:bg-[#9d82ff]"
              >
                <span>Book PS4</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Arcade Machine Card */}
            <div className="relative rounded-2xl border border-[#FFB224]/40 bg-slate-50 dark:bg-[#0E1018] p-6 shadow-xl transition-all duration-200 hover:border-[#FFB224] arcade-glow">
              <div className="flex items-center justify-between mb-4">
                <span className="rounded-md bg-[#FFB224]/20 px-2.5 py-1 text-xs font-bold text-[#C77F00] dark:text-[#FFB224] uppercase">
                  Arcade Cabinet
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">1 Cabinet</span>
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-display text-4xl font-extrabold text-[#C77F00] dark:text-[#FFB224] tabular-nums">
                  {formatBdt(10, lang)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ 3 Coins</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 mb-6">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#C77F00] dark:text-[#FFB224]" />
                  <span>3 tokens = ৳10 base rate</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#C77F00] dark:text-[#FFB224]" />
                  <span>Special Pack: 10 tokens for ৳30</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#C77F00] dark:text-[#FFB224]" />
                  <span>Walk-in friendly · instant play</span>
                </li>
              </ul>
              <Link
                to="/pricing"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFB224] py-2.5 text-xs font-bold text-slate-950 transition hover:bg-[#ffc252]"
              >
                <span>View Token Rates</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-14 border-b border-slate-200 dark:border-[#23273A]/60 bg-slate-50 dark:bg-[#07080D] transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF]">
                {lang === 'bn' ? 'জনপ্রিয় টাইটেল' : 'Featured Catalog'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {lang === 'bn' ? 'শীর্ষ গেমস সমূহ' : 'Top Games at the Zone'}
              </h2>
            </div>
            <Link
              to="/games"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F7CFF] hover:underline"
            >
              <span>{t.exploreGamesBtn}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Price Calculator Teaser */}
      <section className="py-14 border-b border-slate-200 dark:border-[#23273A]/60 bg-white dark:bg-[#07080D] transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF]">
                {lang === 'bn' ? 'স্বচ্ছ ও সহজ হিসাব' : 'Instant Estimate'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                {t.calculatorTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার কনসোল, খেলার সময় এবং প্লেয়ার সংখ্যা বেছে নিয়ে মুহূর্তেই মোট খরচ বের করুন। কোনো লুকানো চার্জ নেই।'
                  : 'Select your preferred console, session duration, and squad size to instantly estimate your bill. No hidden fees.'}
              </p>
              <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
                <p>✓ {lang === 'bn' ? 'পিএস৫ ১ জন ৳৭০/ঘণ্টা · ২ জন ৳১৪০/ঘণ্টা' : 'PS5 rate: 1 Player ৳70/hr · 2 Players ৳140/hr'}</p>
                <p>✓ {lang === 'bn' ? 'পিএস৪ ১ জন ৳৫০/ঘণ্টা · ২ জন ৳১০০/ঘণ্টা' : 'PS4 rate: 1 Player ৳50/hr · 2 Players ৳100/hr'}</p>
                <p>✓ {lang === 'bn' ? 'আর্কেড ৩টি কয়েন মাত্র ৳১০' : 'Arcade 3 tokens = ৳10'}</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <PriceCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Mini Section */}
      <section className="py-14 border-b border-slate-200 dark:border-[#23273A]/60 bg-slate-50 dark:bg-[#07080D] transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF]">
                {lang === 'bn' ? 'সেরা খেলোয়াড়রা' : 'Top Players'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {t.leaderboardTitle}
              </h2>
            </div>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F7CFF] hover:underline"
            >
              <span>{lang === 'bn' ? 'সম্পূর্ণ র‍্যাঙ্কিং দেখুন' : 'Full Leaderboard'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 dark:border-[#23273A] bg-slate-100 dark:bg-[#151826] text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">{t.playerHeader}</th>
                    <th className="py-3 px-4">{t.tierHeader}</th>
                    <th className="py-3 px-4 text-right">{t.sessionsHeader}</th>
                    <th className="py-3 px-4 text-right">{t.hoursHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#23273A] text-slate-800 dark:text-slate-200">
                  {topMembers.map((member, index) => {
                    const safeName = getSafeDisplayName({
                      fullName: member.fullName,
                      nickname: member.nickname,
                      phone: member.phone,
                    });
                    const tier = TIERS.find((t) => member.sessionsCompleted >= t.minSessions) || TIERS[0];

                    return (
                      <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition">
                        <td className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {safeName}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold"
                            style={{ color: tier.color, backgroundColor: tier.badgeBg }}
                          >
                            <Trophy className="h-3 w-3" />
                            <span>{lang === 'bn' ? tier.nameBn : tier.name}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                          {member.sessionsCompleted}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 tabular-nums">
                          {member.totalHours}h
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Location, Directions & Google Map */}
      <section className="py-14 bg-white dark:bg-[#07080D] transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF]">
                {lang === 'bn' ? 'সহজে খুঁজে নিন' : 'Visit Our Shop'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'লোকেশন ও দিকনির্দেশনা' : 'Location & Directions'}
              </h2>
              <div className="rounded-xl border border-[#4F7CFF]/40 bg-[#4F7CFF]/10 p-4 space-y-1">
                <span className="text-xs font-bold text-[#4F7CFF] uppercase block">
                  ★ Key Landmark
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'bn' ? 'স্পর্শ বিউটি বাজ এর ঠিক পাশে' : 'Located right beside Sporsho Beauty Buzz'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {lang === 'bn' ? settings.addressBn : settings.addressEn}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>📍 {lang === 'bn' ? 'গ্রিন সিটি আবাসিক, ব্লক সি, ঢাকা উদ্যান, মোহাম্মদপুর' : 'Green City Residential, Block C, Dhaka Uddan, Mohammadpur'}</p>
                <p>📞 {settings.phones.join(' · ')}</p>
                <p>💬 WhatsApp: {settings.whatsapp}</p>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={settings.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#3b68ee] transition"
                >
                  <MapPin className="h-4 w-4" />
                  <span>{t.getDirections}</span>
                </a>
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-[#151826] px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 transition"
                >
                  <Phone className="h-4 w-4 text-[#4F7CFF]" />
                  <span>{t.callUs}</span>
                </a>
              </div>
            </div>

            {/* Embedded Google Map iframe */}
            <div className="lg:col-span-7 h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-[#23273A] shadow-xl">
              <iframe
                title="Bhai Brother Video Game Location"
                src={settings.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
