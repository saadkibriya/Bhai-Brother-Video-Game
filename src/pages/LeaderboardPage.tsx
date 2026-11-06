import React, { useState } from 'react';
import { Trophy, Award, Star, Crown } from 'lucide-react';
import { useStore } from '../lib/store';
import { TIERS, tierFor } from '../lib/tiers';
import { getSafeDisplayName } from '../lib/displayName';
import { translations } from '../i18n/translations';

export const LeaderboardPage: React.FC = () => {
  const { allMembers, currentUser, lang } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'month'>('all');
  const t = translations[lang];

  // Sort members by completed sessions
  const rankedMembers = [...allMembers]
    .filter((m) => !m.isBanned)
    .sort((a, b) => b.sessionsCompleted - a.sessionsCompleted);

  const top3 = rankedMembers.slice(0, 3);

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-[#07080D] transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-[#F5C451]">
            <Trophy className="h-4 w-4" />
            <span>{t.leaderboardTitle}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {lang === 'bn' ? 'শপ লিডারবোর্ড ও চ্যাম্পিয়নরা' : 'Hall of Fame & Tiers'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            {t.leaderboardSubtitle}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-200/70 dark:bg-[#0E1018] p-1 border border-slate-300 dark:border-[#23273A] w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-[#4F7CFF] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.allTimeTab}
          </button>
          <button
            onClick={() => setActiveTab('month')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              activeTab === 'month'
                ? 'bg-[#4F7CFF] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.thisMonthTab}
          </button>
        </div>

        {/* Top 3 Podium Cards */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* 2nd Place (Silver) */}
            {top3[1] && (
              <div className="rounded-2xl border border-slate-300 dark:border-slate-500/40 bg-white dark:bg-[#0E1018] p-6 text-center space-y-3 order-2 md:order-1 relative shadow-sm dark:shadow-none">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-300/10 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-300/30 text-xl font-black">
                  🥈
                </div>
                <div className="font-display text-lg font-bold text-slate-900 dark:text-white truncate">
                  {getSafeDisplayName({
                    fullName: top3[1].fullName,
                    nickname: top3[1].nickname,
                    phone: top3[1].phone,
                  })}
                </div>
                <div className="text-xs font-bold text-slate-600 dark:text-[#C9D1E0]">
                  {tierFor(top3[1].sessionsCompleted).name} Tier
                </div>
                <div className="border-t border-slate-100 dark:border-white/5 pt-3">
                  <span className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {top3[1].sessionsCompleted}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Sessions Completed</span>
                </div>
              </div>
            )}

            {/* 1st Place (Gold) */}
            {top3[0] && (
              <div className="rounded-2xl border-2 border-amber-400/80 dark:border-[#F5C451]/60 bg-white dark:bg-[#0E1018] p-7 text-center space-y-3 order-1 md:order-2 relative shadow-xl shadow-amber-500/10 dark:shadow-[#F5C451]/10 md:-translate-y-2">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 dark:bg-[#F5C451] px-3 py-0.5 text-[10px] font-extrabold text-slate-950 uppercase flex items-center gap-1 shadow-md">
                  <Crown className="h-3 w-3" />
                  <span>Champion</span>
                </div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-[#F5C451]/20 text-amber-600 dark:text-[#F5C451] border border-amber-300 dark:border-[#F5C451]/40 text-2xl font-black">
                  🥇
                </div>
                <div className="font-display text-xl font-bold text-slate-900 dark:text-white truncate">
                  {getSafeDisplayName({
                    fullName: top3[0].fullName,
                    nickname: top3[0].nickname,
                    phone: top3[0].phone,
                  })}
                </div>
                <div className="text-xs font-bold text-amber-600 dark:text-[#F5C451]">
                  {tierFor(top3[0].sessionsCompleted).name} Tier
                </div>
                <div className="border-t border-slate-100 dark:border-white/5 pt-3">
                  <span className="font-display text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {top3[0].sessionsCompleted}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Sessions Completed ({top3[0].totalHours}h)</span>
                </div>
              </div>
            )}

            {/* 3rd Place (Bronze) */}
            {top3[2] && (
              <div className="rounded-2xl border border-amber-700/30 dark:border-[#C98A5A]/40 bg-white dark:bg-[#0E1018] p-6 text-center space-y-3 order-3 md:order-3 relative shadow-sm dark:shadow-none">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-[#C98A5A]/10 text-amber-800 dark:text-[#C98A5A] border border-amber-300 dark:border-[#C98A5A]/30 text-xl font-black">
                  🥉
                </div>
                <div className="font-display text-lg font-bold text-slate-900 dark:text-white truncate">
                  {getSafeDisplayName({
                    fullName: top3[2].fullName,
                    nickname: top3[2].nickname,
                    phone: top3[2].phone,
                  })}
                </div>
                <div className="text-xs font-bold text-amber-800 dark:text-[#C98A5A]">
                  {tierFor(top3[2].sessionsCompleted).name} Tier
                </div>
                <div className="border-t border-slate-100 dark:border-white/5 pt-3">
                  <span className="font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {top3[2].sessionsCompleted}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Sessions Completed</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-[#23273A] bg-slate-100 dark:bg-[#151826] text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">{t.playerHeader}</th>
                  <th className="py-3.5 px-4">{t.tierHeader}</th>
                  <th className="py-3.5 px-4 text-right">{t.sessionsHeader}</th>
                  <th className="py-3.5 px-4 text-right">{t.hoursHeader}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#23273A] text-slate-700 dark:text-slate-200">
                {rankedMembers.map((member, index) => {
                  const safeName = getSafeDisplayName({
                    fullName: member.fullName,
                    nickname: member.nickname,
                    phone: member.phone,
                  });
                  const tier = tierFor(member.sessionsCompleted);
                  const isYou = currentUser?.id === member.id;

                  return (
                    <tr
                      key={member.id}
                      className={`transition ${
                        isYou
                          ? 'bg-blue-50 dark:bg-[#4F7CFF]/15 border-l-2 border-[#4F7CFF]'
                          : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-500 dark:text-slate-400">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-white">{safeName}</span>
                          {isYou && (
                            <span className="rounded bg-[#4F7CFF] px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold"
                          style={{ color: tier.color, backgroundColor: tier.badgeBg }}
                        >
                          <Award className="h-3 w-3" />
                          <span>{lang === 'bn' ? tier.nameBn : tier.name}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                        {member.sessionsCompleted}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400 tabular-nums">
                        {member.totalHours}h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tier Legend & Perks Section */}
        <div className="rounded-2xl border border-slate-200 dark:border-[#23273A] bg-white dark:bg-[#0E1018] p-6 space-y-4 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500 dark:text-[#F5C451]" />
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'মেম্বারশিপ টায়ার ও সুবিধাসমূহ' : 'Membership Tiers & Perks'}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#151826] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-bold text-sm"
                    style={{ color: tier.color }}
                  >
                    {lang === 'bn' ? tier.nameBn : tier.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {tier.maxSessions !== null
                      ? `${tier.minSessions}–${tier.maxSessions} sessions`
                      : `${tier.minSessions}+ sessions`}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {lang === 'bn' ? tier.perksBn : tier.perksEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
