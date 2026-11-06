import React, { useState } from 'react';
import { ShieldCheck, Coins, HelpCircle, ArrowRight, Sparkles, Calendar, Clock, MessageCircle, AlertTriangle, Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { PriceCalculator } from '../components/PriceCalculator';
import { formatBdt } from '../lib/format';
import { translations } from '../i18n/translations';
import { Link } from 'react-router-dom';

export const PricingPage: React.FC = () => {
  const { pricingRules, pricingPackages, arcadeRates, arcadeMachines, faqs, settings, lang } = useStore();
  const t = translations[lang];

  const [packageTab, setPackageTab] = useState<'weekly' | 'monthly' | 'squad'>('weekly');

  const weeklyPackages = pricingPackages.filter((p) => p.type === 'weekly');
  const monthlyPackages = pricingPackages.filter((p) => p.type === 'monthly');
  const squadPackages = pricingPackages.filter((p) => p.type === 'hourly_pass');

  const getPackageWhatsAppUrl = (pkgName: string, price: number) => {
    const text =
      lang === 'bn'
        ? `হ্যালো ভাই ব্রাদার ভিডিও গেম, আমি "${pkgName}" (৳${price}) প্যাকেজটি সাবস্ক্রাইব করতে চাচ্ছি। বিস্তারিত জানাবেন?`
        : `Hello Bhai Brother Video Game, I would like to subscribe to the "${pkgName}" (৳${price}) package. Please share details.`;
    return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-[#07080D] transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF]">
            {lang === 'bn' ? 'স্বচ্ছ রেট চার্ট ও প্যাকেজ' : 'Official Rates & Value Passes'}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t.pricingTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            {lang === 'bn'
              ? '৩০ মিনিট এবং ঘণ্টার ভিত্তিতে খেলা যায়। রেগুলার প্লেয়ারদের জন্য রয়েছে সাপ্তাহিক ও মাসিক সাশ্রয়ী প্যাকেজ।'
              : 'Choose between 30-min quick matches, standard hourly sessions, or weekly and monthly discounted passes.'}
          </p>
        </div>

        {/* Mandatory Early Arrival Alert Banner */}
        <div className="rounded-2xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-5 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm">
              {lang === 'bn' ? '⚠️ বুকিং সদস্যদের জন্য গুরুত্বপূর্ণ: ১০–২০ মিনিট পূর্বে উপস্থিতি' : '⚠️ Important for Booked Members: 10 to 20 Minutes Early Arrival'}
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {lang === 'bn'
                ? 'অনলাইনে স্লট বুক করার পর আপনার নির্ধারিত সময় শুরুর অন্তত ১০ থেকে ২০ মিনিট আগে শপে উপস্থিত থাকতে হবে। নির্ধারিত সময়ের ১০ মিনিট পূর্বে উপস্থিত না হলে স্লটটি স্বয়ংক্রিয়ভাবে অপেক্ষমান ওয়াক-ইন প্লেয়ারের জন্য উন্মুক্ত করা হতে পারে।'
                : 'All booked members must arrive at Bhai Brother Video Game 10 to 20 minutes before their booked slot time to claim and set up their station. If you do not arrive at least 10 minutes prior, the slot may be released to waiting walk-in players.'}
            </p>
          </div>
        </div>

        {/* Rate Cards Grid (Showing 30 mins AND 1 hour rates explicitly) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {lang === 'bn' ? 'স্টেশন রেট (৩০ মিনিট ও ঘণ্টা ভিত্তিক)' : 'Station Rates (30 Mins & Hourly)'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Play solo or with a partner. Exactly 1 PS5, 1 PS4, and 1 Arcade machine in lounge.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* PS5 Rate Card */}
            <div className="rounded-2xl border border-[#3DA9FC]/40 bg-white dark:bg-[#0E1018] p-6 shadow-xl relative ps5-glow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#3DA9FC]/20 px-2.5 py-1 text-xs font-bold text-[#1C7FD0] dark:text-[#3DA9FC] uppercase">
                    PlayStation 5
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-[#2BD98A] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    30m & 1h Available
                  </span>
                </div>

                {/* 30 Min & 1 Hour Pricing Blocks */}
                <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#151826] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      30 Mins (Quick)
                    </span>
                    <span className="font-display text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                      ৳35
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      1P ৳35 · 2P ৳70
                    </span>
                  </div>
                  <div className="border-l border-slate-200 dark:border-white/10 pl-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C7FD0] dark:text-[#3DA9FC] block">
                      1 Hour (Standard)
                    </span>
                    <span className="font-display text-2xl font-black text-[#1C7FD0] dark:text-[#3DA9FC] tabular-nums">
                      ৳70
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      1P ৳70 · 2P ৳140
                    </span>
                  </div>
                </div>

                <div className="my-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#1C7FD0] dark:text-[#3DA9FC] shrink-0" />
                    <span><strong>1 Person:</strong> ৳35 (30m) · ৳70 (1h)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#1C7FD0] dark:text-[#3DA9FC] shrink-0" />
                    <span><strong>2 Persons:</strong> ৳70 (30m) · ৳140 (1h)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#1C7FD0] dark:text-[#3DA9FC] shrink-0" />
                    <span>4K HDR Displays & DualSense wireless controllers</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#1C7FD0] dark:text-[#3DA9FC] shrink-0" />
                    <span>Latest FC 26, Tekken 8, MK1, CoD, GTA V</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/book?platform=ps5&duration=30"
                  className="flex items-center justify-center gap-1 rounded-xl bg-sky-100 dark:bg-[#3DA9FC]/20 py-2.5 text-xs font-bold text-[#1C7FD0] dark:text-[#3DA9FC] hover:bg-sky-200 dark:hover:bg-[#3DA9FC]/30 transition"
                >
                  <span>Book 30 Mins</span>
                </Link>
                <Link
                  to="/book?platform=ps5&duration=60"
                  className="flex items-center justify-center gap-1 rounded-xl bg-[#3DA9FC] py-2.5 text-xs font-bold text-slate-950 hover:bg-[#6ec5ff] transition shadow-md shadow-[#3DA9FC]/20"
                >
                  <span>Book 1 Hour</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* PS4 Rate Card */}
            <div className="rounded-2xl border border-[#8B6CFF]/40 bg-white dark:bg-[#0E1018] p-6 shadow-xl relative ps4-glow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#8B6CFF]/20 px-2.5 py-1 text-xs font-bold text-[#6A4BE0] dark:text-[#8B6CFF] uppercase">
                    PlayStation 4
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-[#2BD98A] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    30m & 1h Available
                  </span>
                </div>

                {/* 30 Min & 1 Hour Pricing Blocks */}
                <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-[#151826] p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      30 Mins (Quick)
                    </span>
                    <span className="font-display text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                      ৳25
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      1P ৳25 · 2P ৳50
                    </span>
                  </div>
                  <div className="border-l border-slate-200 dark:border-white/10 pl-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A4BE0] dark:text-[#8B6CFF] block">
                      1 Hour (Standard)
                    </span>
                    <span className="font-display text-2xl font-black text-[#6A4BE0] dark:text-[#8B6CFF] tabular-nums">
                      ৳50
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      1P ৳50 · 2P ৳100
                    </span>
                  </div>
                </div>

                <div className="my-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#6A4BE0] dark:text-[#8B6CFF] shrink-0" />
                    <span><strong>1 Person:</strong> ৳25 (30m) · ৳50 (1h)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#6A4BE0] dark:text-[#8B6CFF] shrink-0" />
                    <span><strong>2 Persons:</strong> ৳50 (30m) · ৳100 (1h)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#6A4BE0] dark:text-[#8B6CFF] shrink-0" />
                    <span>PS4 Pro console with low input latency</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#6A4BE0] dark:text-[#8B6CFF] shrink-0" />
                    <span>DualShock 4 wireless controllers</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/book?platform=ps4&duration=30"
                  className="flex items-center justify-center gap-1 rounded-xl bg-purple-100 dark:bg-[#8B6CFF]/20 py-2.5 text-xs font-bold text-[#6A4BE0] dark:text-[#8B6CFF] hover:bg-purple-200 dark:hover:bg-[#8B6CFF]/30 transition"
                >
                  <span>Book 30 Mins</span>
                </Link>
                <Link
                  to="/book?platform=ps4&duration=60"
                  className="flex items-center justify-center gap-1 rounded-xl bg-[#8B6CFF] py-2.5 text-xs font-bold text-white hover:bg-[#9d82ff] transition shadow-md shadow-[#8B6CFF]/20"
                >
                  <span>Book 1 Hour</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Arcade Machine Tokens */}
            <div className="rounded-2xl border border-[#FFB224]/40 bg-white dark:bg-[#0E1018] p-6 shadow-xl relative arcade-glow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#FFB224]/20 px-2.5 py-1 text-xs font-bold text-[#C77F00] dark:text-[#FFB224] uppercase">
                    Arcade Tokens
                  </span>
                  <span className="text-[10px] font-bold text-[#119A5F] dark:text-[#2BD98A] bg-[#2BD98A]/10 border border-[#2BD98A]/20 px-2 py-0.5 rounded">
                    3 Coins = ৳10
                  </span>
                </div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-extrabold text-[#C77F00] dark:text-[#FFB224] tabular-nums">
                    {formatBdt(10, lang)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">/ 3 Coins</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Classic coin-op cabinet · No reservation needed, walk in anytime
                </p>
                <div className="my-5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {arcadeRates.map((r) => (
                    <div key={r.id} className="flex justify-between items-center bg-slate-50 dark:bg-[#151826] p-2.5 rounded-lg border border-slate-100 dark:border-white/5">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {r.coins} Tokens {r.coins === 10 ? '(Special Pack ⭐)' : ''}
                      </span>
                      <span className="font-bold text-[#C77F00] dark:text-[#FFB224] tabular-nums">
                        {formatBdt(r.priceBdt, lang)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Hello Bhai Brother Video Game, I would like to buy arcade tokens.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FFB224] py-2.5 text-xs font-bold text-slate-950 hover:bg-[#ffc24c] transition shadow-md shadow-[#FFB224]/20"
                >
                  <Coins className="h-4 w-4" />
                  <span>Get Arcade Tokens at Desk</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* WEEKLY & MONTHLY PACKAGES SECTION */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#4F7CFF] uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>{lang === 'bn' ? 'সাপ্তাহিক ও মাসিক প্যাকেজ' : 'Weekly & Monthly Member Passes'}</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {lang === 'bn' ? 'নিয়মিত প্লেয়ারদের জন্য বিশেষ সাশ্রয়' : 'Gamer Passes & Bulk Subscriptions'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'সাপ্তাহিক বা মাসিক পাস কিনলে পাচ্ছেন ফ্রি আর্কেড কয়েন, প্রায়োরিটি বুকিং এবং টায়ার আপগ্রেড।'
                  : 'Play more and pay less with dedicated weekly and monthly passes plus bonus arcade tokens.'}
              </p>
            </div>

            {/* Pass Category Switcher */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-[#151826] p-1 border border-slate-200 dark:border-[#23273A] w-fit">
              <button
                onClick={() => setPackageTab('weekly')}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                  packageTab === 'weekly'
                    ? 'bg-[#4F7CFF] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'সাপ্তাহিক পাস (৭ দিন)' : 'Weekly Passes (7 Days)'}
              </button>
              <button
                onClick={() => setPackageTab('monthly')}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                  packageTab === 'monthly'
                    ? 'bg-[#4F7CFF] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'মাসিক পাস (৩০ দিন)' : 'Monthly Passes (30 Days)'}
              </button>
              <button
                onClick={() => setPackageTab('squad')}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                  packageTab === 'squad'
                    ? 'bg-[#4F7CFF] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'টানা ৩-ঘণ্টা পাস' : '3-Hour Squad'}
              </button>
            </div>
          </div>

          {/* TAB 1: WEEKLY PACKAGES */}
          {packageTab === 'weekly' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {weeklyPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between relative shadow-lg ${
                    pkg.platform === 'ps5'
                      ? 'border-[#3DA9FC]/40 bg-sky-50/40 dark:bg-[#3DA9FC]/5'
                      : 'border-[#8B6CFF]/40 bg-purple-50/40 dark:bg-[#8B6CFF]/5'
                  }`}
                >
                  {pkg.popularTag && (
                    <div className="absolute -top-3 right-6 rounded-full bg-[#2BD98A] px-3 py-0.5 text-[10px] font-extrabold text-slate-950 uppercase shadow-md">
                      {pkg.popularTag}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#4F7CFF]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {pkg.validityDays} Days Validity · {pkg.totalHours} Hours Total
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-2">
                      {lang === 'bn' ? pkg.label_bn : pkg.label_en}
                    </h3>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-display text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                        {formatBdt(pkg.price_bdt, lang)}
                      </span>
                      <span className="text-xs text-slate-400 line-through tabular-nums">
                        ৳{pkg.originalPriceBdt}
                      </span>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-[#2BD98A]">
                        Save ৳{pkg.savingsBdt}
                      </span>
                    </div>

                    <ul className="mt-5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      {(lang === 'bn' ? pkg.perksBn : pkg.perksEn).map((perk, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-600 dark:text-[#2BD98A] shrink-0" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex gap-2">
                    <a
                      href={getPackageWhatsAppUrl(pkg.label_en, pkg.price_bdt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-xs font-bold text-white shadow-md shadow-[#25D366]/20 hover:bg-[#20ba5a] transition"
                    >
                      <MessageCircle className="h-4 w-4 fill-white text-transparent" />
                      <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে বুক করুন' : 'Get Pass on WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MONTHLY PACKAGES */}
          {packageTab === 'monthly' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {monthlyPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between relative shadow-lg ${
                    pkg.platform === 'ps5'
                      ? 'border-[#3DA9FC]/50 bg-gradient-to-br from-sky-50/70 to-indigo-50/50 dark:from-[#3DA9FC]/10 dark:to-indigo-950/20'
                      : 'border-[#8B6CFF]/50 bg-gradient-to-br from-purple-50/70 to-violet-50/50 dark:from-[#8B6CFF]/10 dark:to-purple-950/20'
                  }`}
                >
                  {pkg.popularTag && (
                    <div className="absolute -top-3 right-6 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-extrabold text-slate-950 uppercase shadow-md flex items-center gap-1">
                      <span>{pkg.popularTag}</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#4F7CFF]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {pkg.validityDays} Days Validity · {pkg.totalHours} Hours Total
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-2">
                      {lang === 'bn' ? pkg.label_bn : pkg.label_en}
                    </h3>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="font-display text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                        {formatBdt(pkg.price_bdt, lang)}
                      </span>
                      <span className="text-xs text-slate-400 line-through tabular-nums">
                        ৳{pkg.originalPriceBdt}
                      </span>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-[#2BD98A]">
                        Save ৳{pkg.savingsBdt}
                      </span>
                    </div>

                    <ul className="mt-5 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                      {(lang === 'bn' ? pkg.perksBn : pkg.perksEn).map((perk, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-600 dark:text-[#2BD98A] shrink-0" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex gap-2">
                    <a
                      href={getPackageWhatsAppUrl(pkg.label_en, pkg.price_bdt)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-xs font-bold text-white shadow-md shadow-[#25D366]/20 hover:bg-[#20ba5a] transition"
                    >
                      <MessageCircle className="h-4 w-4 fill-white text-transparent" />
                      <span>{lang === 'bn' ? 'হোয়াটসঅ্যাপে বুক করুন' : 'Get Pass on WhatsApp'}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CONTINUOUS SQUAD PASSES */}
          {packageTab === 'squad' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {squadPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151826] p-6 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF]">
                      3 Hours Non-Stop Tournament Prep
                    </span>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {lang === 'bn' ? pkg.label_bn : pkg.label_en}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-2xl font-black text-slate-900 dark:text-white tabular-nums">
                        {formatBdt(pkg.price_bdt, lang)}
                      </span>
                      <span className="text-xs text-slate-400 line-through tabular-nums">
                        ৳{pkg.originalPriceBdt}
                      </span>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-[#2BD98A]">
                        Save ৳{pkg.savingsBdt}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/5">
                    <Link
                      to={`/book?platform=${pkg.platform}&duration=180`}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4F7CFF] py-2.5 text-xs font-bold text-white hover:bg-[#3b68ee] transition"
                    >
                      <span>Book 3-Hour Slot</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Calculator Section */}
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {t.calculatorTitle}
          </h2>
          <PriceCalculator />
        </div>

        {/* FAQs & House Rules (Includes Arrival Buffer Rule) */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5 text-[#4F7CFF]" />
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'সাধারণ জিজ্ঞাসা ও শপ রুলস' : 'FAQ & House Rules'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#151826] p-4 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F7CFF]">
                  {faq.kind === 'faq' ? 'FAQ' : 'Rule'}
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {lang === 'bn' ? faq.qBn : faq.qEn}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'bn' ? faq.aBn : faq.aEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
