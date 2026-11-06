import React, { useState } from 'react';
import { Gamepad2, Coins, ArrowRight, Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { estimatePrice, arcadeTaka } from '../lib/pricing';
import { formatBdt, formatDurationMinutes } from '../lib/format';
import { translations } from '../i18n/translations';
import { useNavigate } from 'react-router-dom';

export const PriceCalculator: React.FC = () => {
  const { pricingRules, pricingPackages, settings, lang } = useStore();
  const navigate = useNavigate();
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'console' | 'arcade'>('console');
  const [platform, setPlatform] = useState<'ps5' | 'ps4'>('ps5');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [players, setPlayers] = useState<number>(2);

  // Arcade state
  const [coins, setCoins] = useState<number>(6);

  // Calculate console price
  const estimate = estimatePrice({
    platform,
    durationMinutes,
    players,
    rule: pricingRules[platform],
    packages: pricingPackages,
    priceRounding: settings.priceRounding,
  });

  // Calculate arcade price
  const arcadeCalc = arcadeTaka(coins);

  const durationOptions = [30, 60, 90, 120, 180, 240];

  const handleBookNow = () => {
    navigate(`/book?platform=${platform}&duration=${durationMinutes}&players=${players}`);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 shadow-xl transition-colors">
      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-[#151826] p-1 mb-6 border border-slate-200 dark:border-[#23273A]">
        <button
          onClick={() => setActiveTab('console')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
            activeTab === 'console'
              ? 'bg-[#4F7CFF] text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Gamepad2 className="h-4 w-4" />
          <span>{lang === 'bn' ? 'পিএস৫ / পিএস৪ কনসোল' : 'PS5 & PS4 Lounge'}</span>
        </button>
        <button
          onClick={() => setActiveTab('arcade')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition ${
            activeTab === 'arcade'
              ? 'bg-[#FFB224] text-slate-950 shadow-md font-extrabold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>{lang === 'bn' ? 'আর্কেড কয়েন মেশিন' : 'Arcade Tokens (3 = ৳10)'}</span>
        </button>
      </div>

      {activeTab === 'console' ? (
        <div className="space-y-6">
          {/* Platform selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
              {t.calcPlatform}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlatform('ps5')}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                  platform === 'ps5'
                    ? 'border-[#3DA9FC] bg-[#3DA9FC]/15 text-slate-900 dark:text-white ps5-glow'
                    : 'border-slate-200 dark:border-[#23273A] bg-slate-50 dark:bg-[#151826] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <div>
                  <span className="block font-bold text-sm text-[#1C7FD0] dark:text-[#3DA9FC]">PlayStation 5</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatBdt(pricingRules.ps5.hourly_bdt, lang)} {t.perHour}
                  </span>
                </div>
                {platform === 'ps5' && <Check className="h-4 w-4 text-[#3DA9FC]" />}
              </button>

              <button
                type="button"
                onClick={() => setPlatform('ps4')}
                className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                  platform === 'ps4'
                    ? 'border-[#8B6CFF] bg-[#8B6CFF]/15 text-slate-900 dark:text-white ps4-glow'
                    : 'border-slate-200 dark:border-[#23273A] bg-slate-50 dark:bg-[#151826] text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <div>
                  <span className="block font-bold text-sm text-[#6A4BE0] dark:text-[#8B6CFF]">PlayStation 4</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatBdt(pricingRules.ps4.hourly_bdt, lang)} {t.perHour}
                  </span>
                </div>
                {platform === 'ps4' && <Check className="h-4 w-4 text-[#8B6CFF]" />}
              </button>
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t.calcDuration} (30 Mins & Hourly Available)
              </label>
              <span className="text-xs font-bold text-[#4F7CFF]">
                {formatDurationMinutes(durationMinutes, lang)}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { m: 30, tag: '30m' },
                { m: 60, tag: '1h' },
                { m: 90, tag: '1.5h' },
                { m: 120, tag: '2h' },
                { m: 180, tag: '3h' },
                { m: 240, tag: '4h' },
              ].map(({ m, tag }) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDurationMinutes(m)}
                  className={`rounded-lg py-2.5 text-xs font-bold transition ${
                    durationMinutes === m
                      ? 'bg-[#4F7CFF] text-white shadow-sm ring-2 ring-[#4F7CFF]/30'
                      : 'bg-slate-100 dark:bg-[#151826] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1c2033]'
                  }`}
                >
                  <span className="block">{tag}</span>
                  <span className="text-[9px] font-normal opacity-80 block">{m === 30 ? 'Quick' : `${m}m`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Players Selector */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {t.calcPlayers}
              </label>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {players} {lang === 'bn' ? 'জন' : 'Players'}
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPlayers(num)}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                    players === num
                      ? 'bg-[#4F7CFF] text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-[#151826] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1c2033]'
                  }`}
                >
                  {num}P
                </button>
              ))}
            </div>
          </div>

          {/* Price Breakdown & Big Total */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#151826] p-4 transition-colors">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{t.calcEstTotal}</span>
                <span className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {formatBdt(estimate.finalBdt, lang)}
                </span>
              </div>
              <button
                onClick={handleBookNow}
                className="flex items-center gap-2 rounded-xl bg-[#4F7CFF] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#4F7CFF]/25 hover:bg-[#3b68ee] transition active:scale-95"
              >
                <span>{t.bookSlotBtn}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 border-t border-slate-200 dark:border-white/5 pt-3 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>{platform.toUpperCase()} ({durationMinutes} mins · {players}P):</span>
                <span className="tabular-nums font-semibold text-slate-700 dark:text-slate-300">{formatBdt(estimate.finalBdt, lang)}</span>
              </div>
              {estimate.packageDiscount > 0 && (
                <div className="flex justify-between text-[#119A5F] dark:text-[#2BD98A]">
                  <span>Package Discount ({estimate.appliedPackage?.label_en}):</span>
                  <span className="tabular-nums font-semibold">-{formatBdt(estimate.packageDiscount, lang)}</span>
                </div>
              )}
              {/* Arrival Buffer Reminder */}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1.5 mt-2">
                <span>⚠️</span>
                <span>
                  {lang === 'bn'
                    ? 'স্লট শুরুর ১০–২০ মিনিট আগে শপে উপস্থিত থাকুন।'
                    : 'Must arrive 10 to 20 minutes before your slot to secure console.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Arcade Token Calculator */
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {lang === 'bn' ? 'কয়েন সংখ্যা নির্বাচন করুন' : 'Tokens Needed'}
              </label>
              <span className="text-xs font-bold text-[#C77F00] dark:text-[#FFB224]">
                {coins} {t.coinsLabel}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 9, 10, 12, 15, 20, 30].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCoins(num)}
                  className={`rounded-lg py-2.5 text-xs font-bold transition ${
                    coins === num
                      ? 'bg-[#FFB224] text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-100 dark:bg-[#151826] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#1c2033]'
                  }`}
                >
                  {num} {t.coinsLabel} {num === 10 ? '⭐' : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-slate-50 dark:bg-[#151826] p-4 transition-colors">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">
                  {lang === 'bn' ? 'মোট খরচ (টাকা)' : 'Total Cost (BDT)'}
                </span>
                <span className="font-display text-3xl font-bold tracking-tight text-[#C77F00] dark:text-[#FFB224] tabular-nums">
                  {formatBdt(arcadeCalc.totalBdt, lang)}
                </span>
              </div>
              <span className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs font-bold text-[#C77F00] dark:text-[#FFB224]">
                {arcadeCalc.recommendedCoins} {t.coinsLabel}
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-white/5 pt-2">
              {lang === 'bn' ? arcadeCalc.explanationBn : arcadeCalc.explanationEn}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {lang === 'bn'
                ? 'আর্কেড মেশিন কাউন্টারে টোকেন দেওয়া হয়। সরাসরি এসে খেলা শুরু করতে পারেন।'
                : 'Arcade tokens available at the front desk. Walk-in friendly, no booking needed.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
