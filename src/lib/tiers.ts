/**
 * Member Tiers & Progress Logic per FR-LDB-03
 * Rookie: 0–4 · Bronze: 5–14 · Silver: 15–29 · Gold: 30–59 · Platinum: 60–99 · Diamond: 100+
 */

export type TierName = 'Rookie' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface TierInfo {
  name: TierName;
  nameBn: string;
  minSessions: number;
  maxSessions: number | null; // null for Diamond
  color: string;
  badgeBg: string;
  perksEn: string;
  perksBn: string;
}

export const TIERS: TierInfo[] = [
  {
    name: 'Rookie',
    nameBn: 'রুকি',
    minSessions: 0,
    maxSessions: 4,
    color: '#8A90A6',
    badgeBg: 'rgba(138, 144, 166, 0.15)',
    perksEn: 'Standard booking and profile access',
    perksBn: 'স্ট্যান্ডার্ড বুকিং এবং প্রোফাইল সুবিধা',
  },
  {
    name: 'Bronze',
    nameBn: 'ব্রোঞ্জ',
    minSessions: 5,
    maxSessions: 14,
    color: '#C98A5A',
    badgeBg: 'rgba(201, 138, 90, 0.15)',
    perksEn: 'Priority slot confirmation',
    perksBn: 'অগ্রাধিকারভিত্তিতে স্লট কনফার্মেশন',
  },
  {
    name: 'Silver',
    nameBn: 'সিলভার',
    minSessions: 15,
    maxSessions: 29,
    color: '#C9D1E0',
    badgeBg: 'rgba(201, 209, 224, 0.15)',
    perksEn: 'Free 15 min warm-up once a month',
    perksBn: 'মাসে একবার ফ্রি ১৫ মিনিট ওয়ার্ম-আপ',
  },
  {
    name: 'Gold',
    nameBn: 'গোল্ড',
    minSessions: 30,
    maxSessions: 59,
    color: '#F5C451',
    badgeBg: 'rgba(245, 196, 81, 0.15)',
    perksEn: '10% weekday afternoon discount & tournament pass',
    perksBn: 'ছুটির দিন ছাড়া বিকালে ১০% ছাড় ও টুর্নামেন্ট পাস',
  },
  {
    name: 'Platinum',
    nameBn: 'প্লাটিনাম',
    minSessions: 60,
    maxSessions: 99,
    color: '#7FE3D6',
    badgeBg: 'rgba(127, 227, 214, 0.15)',
    perksEn: 'Free arcade token bundle with every PS5 2h booking',
    perksBn: 'প্রতি ২ ঘণ্টা পিএস৫ বুকিংয়ে ফ্রি আর্কেড টোকেন',
  },
  {
    name: 'Diamond',
    nameBn: 'ডায়মন্ড',
    minSessions: 100,
    maxSessions: null,
    color: '#9DB8FF',
    badgeBg: 'rgba(157, 184, 255, 0.15)',
    perksEn: 'VIP status, custom controller reservation, leaderboard champion badge',
    perksBn: 'ভিআইপি স্ট্যাটাস, কাস্টম কন্ট্রোলার ও চ্যাম্পিয়ন ব্যাজ',
  },
];

export interface TierProgress {
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  sessionsCompleted: number;
  sessionsNeededForNext: number;
  progressPercent: number; // 0 - 100
}

export function tierFor(sessionsCompleted: number): TierInfo {
  const count = Math.max(0, sessionsCompleted || 0);
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (count >= TIERS[i].minSessions) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

export function getTierProgress(sessionsCompleted: number): TierProgress {
  const count = Math.max(0, sessionsCompleted || 0);
  const currentTier = tierFor(count);
  const currentIndex = TIERS.findIndex((t) => t.name === currentTier.name);
  const nextTier = currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      sessionsCompleted: count,
      sessionsNeededForNext: 0,
      progressPercent: 100,
    };
  }

  const tierRange = nextTier.minSessions - currentTier.minSessions;
  const progressInTier = count - currentTier.minSessions;
  const progressPercent = Math.min(100, Math.max(0, Math.round((progressInTier / tierRange) * 100)));
  const sessionsNeededForNext = Math.max(0, nextTier.minSessions - count);

  return {
    currentTier,
    nextTier,
    sessionsCompleted: count,
    sessionsNeededForNext,
    progressPercent,
  };
}
