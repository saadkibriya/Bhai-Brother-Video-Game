/**
 * Pricing Logic per FR-PRC-01, FR-PRC-03, FR-PRC-04, FR-PRC-05
 * Supports:
 * - 30-minute and hourly rates for PS5 & PS4
 * - Weekly & Monthly membership passes
 * - Multi-hour continuous squad passes
 * - Arcade token packs (3 for ৳10)
 */

export interface PricingRule {
  platform: 'ps5' | 'ps4' | 'arcade';
  hourly_bdt: number;
  extra_player_hourly_bdt: number;
  min_minutes: number;
  increment_minutes: number;
}

export const DEFAULT_PRICING_RULES: Record<'ps5' | 'ps4', PricingRule> = {
  ps5: {
    platform: 'ps5',
    hourly_bdt: 70,
    extra_player_hourly_bdt: 70,
    min_minutes: 30,
    increment_minutes: 30,
  },
  ps4: {
    platform: 'ps4',
    hourly_bdt: 50,
    extra_player_hourly_bdt: 50,
    min_minutes: 30,
    increment_minutes: 30,
  },
};

export interface PricingPackage {
  id: string;
  platform: 'ps5' | 'ps4';
  type: 'hourly_pass' | 'weekly' | 'monthly';
  label_en: string;
  label_bn: string;
  minutes: number;
  totalHours: number;
  validityDays: number;
  price_bdt: number;
  originalPriceBdt: number;
  savingsBdt: number;
  perksEn: string[];
  perksBn: string[];
  is_active: boolean;
  popularTag?: string;
}

export const SAMPLE_PACKAGES: PricingPackage[] = [
  // WEEKLY PACKAGES
  {
    id: 'ps5-weekly',
    platform: 'ps5',
    type: 'weekly',
    label_en: 'PS5 Weekly Pro Pass',
    label_bn: 'পিএস৫ সাপ্তাহিক প্রো পাস',
    minutes: 420,
    totalHours: 7,
    validityDays: 7,
    price_bdt: 420, // ৳60/hr effective (save ৳70)
    originalPriceBdt: 490,
    savingsBdt: 70,
    perksEn: [
      '7 Hours PS5 gameplay valid for 7 days',
      'Flexible 30m or 1h slots anytime',
      '10 Free Arcade tokens included',
      'Priority booking queue via phone/web'
    ],
    perksBn: [
      '৭ দিনে মোট ৭ ঘণ্টা পিএস৫ গেমিং',
      'যেকোনো সময় ৩০মি বা ১ঘণ্টার ফ্লেক্সিবল স্লট',
      '১০টি ফ্রি আর্কেড টোকেন উপহার',
      'ফোন বা ওয়েবে অগ্রিম প্রায়োরিটি বুকিং'
    ],
    is_active: true,
    popularTag: 'Weekly Best',
  },
  {
    id: 'ps4-weekly',
    platform: 'ps4',
    type: 'weekly',
    label_en: 'PS4 Weekly Pro Pass',
    label_bn: 'পিএস৪ সাপ্তাহিক প্রো পাস',
    minutes: 420,
    totalHours: 7,
    validityDays: 7,
    price_bdt: 300, // ৳42.8/hr effective (save ৳50)
    originalPriceBdt: 350,
    savingsBdt: 50,
    perksEn: [
      '7 Hours PS4 gameplay valid for 7 days',
      'Flexible 30m or 1h slots anytime',
      '10 Free Arcade tokens included',
      'DualShock 4 wireless controllers'
    ],
    perksBn: [
      '৭ দিনে মোট ৭ ঘণ্টা পিএস৪ গেমিং',
      'যেকোনো সময় ৩০মি বা ১ঘণ্টার ফ্লেক্সিবল স্লট',
      '১০টি ফ্রি আর্কেড টোকেন উপহার',
      'ডুয়ালশক ৪ ওয়্যারলেস কন্ট্রোলার'
    ],
    is_active: true,
  },

  // MONTHLY PACKAGES
  {
    id: 'ps5-monthly',
    platform: 'ps5',
    type: 'monthly',
    label_en: 'PS5 Monthly Master Pass',
    label_bn: 'পিএস৫ মাসিক মাস্টার পাস',
    minutes: 1800,
    totalHours: 30,
    validityDays: 30,
    price_bdt: 1750, // ৳58.3/hr effective (save ৳350)
    originalPriceBdt: 2100,
    savingsBdt: 350,
    perksEn: [
      '30 Hours PS5 gameplay valid for 30 days (~1h/day)',
      'Direct Platinum Tier loyalty rank boost',
      '40 Free Arcade tokens included',
      'Free entry pass to 1 Friday tournament'
    ],
    perksBn: [
      '৩০ দিনে মোট ৩০ ঘণ্টা পিএস৫ গেমিং (~প্রতিদিন ১ ঘণ্টা)',
      'সরাসরি প্ল্যাটিনাম টায়ার মেম্বারশিপ বুস্ট',
      '৪০টি ফ্রি আর্কেড টোকেন উপহার',
      '১টি ফ্রাইডে টুর্নামেন্টে ফ্রি এন্ট্রি পাস'
    ],
    is_active: true,
    popularTag: 'Most Value ⭐',
  },
  {
    id: 'ps4-monthly',
    platform: 'ps4',
    type: 'monthly',
    label_en: 'PS4 Monthly Champion Pass',
    label_bn: 'পিএস৪ মাসিক চ্যাম্পিয়ন পাস',
    minutes: 1800,
    totalHours: 30,
    validityDays: 30,
    price_bdt: 1200, // ৳40/hr effective (save ৳300)
    originalPriceBdt: 1500,
    savingsBdt: 300,
    perksEn: [
      '30 Hours PS4 gameplay valid for 30 days (~1h/day)',
      'Direct Gold Tier loyalty rank boost',
      '30 Free Arcade tokens included',
      'Free entry pass to 1 tournament'
    ],
    perksBn: [
      '৩০ দিনে মোট ৩০ ঘণ্টা পিএস৪ গেমিং (~প্রতিদিন ১ ঘণ্টা)',
      'সরাসরি গোল্ড টায়ার মেম্বারশিপ বুস্ট',
      '৩০টি ফ্রি আর্কেড টোকেন উপহার',
      '১টি টুর্নামেন্টে ফ্রি এন্ট্রি পাস'
    ],
    is_active: true,
  },

  // CONTINUOUS SQUAD PASSES
  {
    id: 'ps5-3hr',
    platform: 'ps5',
    type: 'hourly_pass',
    label_en: 'PS5 3-Hour Continuous Squad Pass',
    label_bn: 'পিএস৫ ৩-ঘণ্টা স্কোয়াড পাস',
    minutes: 180,
    totalHours: 3,
    validityDays: 1,
    price_bdt: 190, // savings vs ৳210
    originalPriceBdt: 210,
    savingsBdt: 20,
    perksEn: ['3 hours continuous PS5 session', 'Save ৳20 vs standard rate'],
    perksBn: ['টানা ৩ ঘণ্টা পিএস৫ গেমিং সেশন', 'স্ট্যান্ডার্ড রেট থেকে ২০ টাকা সাশ্রয়'],
    is_active: true,
  },
  {
    id: 'ps4-3hr',
    platform: 'ps4',
    type: 'hourly_pass',
    label_en: 'PS4 3-Hour Continuous Squad Pass',
    label_bn: 'পিএস৪ ৩-ঘণ্টা স্কোয়াড পাস',
    minutes: 180,
    totalHours: 3,
    validityDays: 1,
    price_bdt: 135, // savings vs ৳150
    originalPriceBdt: 150,
    savingsBdt: 15,
    perksEn: ['3 hours continuous PS4 session', 'Save ৳15 vs standard rate'],
    perksBn: ['টানা ৩ ঘণ্টা পিএস৪ গেমিং সেশন', 'স্ট্যান্ডার্ড রেট থেকে ১৫ টাকা সাশ্রয়'],
    is_active: true,
  },
];

export interface PriceEstimateInput {
  platform: 'ps5' | 'ps4';
  durationMinutes: number;
  players?: number;
  rule?: PricingRule;
  packages?: PricingPackage[];
  priceRounding?: number;
}

export interface PriceBreakdown {
  billableMinutes: number;
  baseAmount: number;
  extraPlayerAmount: number;
  packageDiscount: number;
  totalBeforeRounding: number;
  finalBdt: number;
  appliedPackage?: PricingPackage;
}

export function estimatePrice(input: PriceEstimateInput): PriceBreakdown {
  const {
    platform,
    durationMinutes,
    players = 1,
    rule = DEFAULT_PRICING_RULES[platform],
    packages = SAMPLE_PACKAGES,
    priceRounding = 5,
  } = input;

  const minMinutes = rule.min_minutes || 30;
  const increment = rule.increment_minutes || 30;

  // 1. billable = max(min_minutes, ceil(duration / increment) * increment)
  const billableMinutes = Math.max(minMinutes, Math.ceil(durationMinutes / increment) * increment);

  // 2. base = hourly_bdt * billable / 60
  // For 30 mins:
  // PS5: 70 * 30 / 60 = 35 BDT
  // PS4: 50 * 30 / 60 = 25 BDT
  const baseAmount = (rule.hourly_bdt * billableMinutes) / 60;

  // 3. extra = extra_player_hourly_bdt * max(players - 1, 0) * billable / 60
  // For 30 mins 2 players:
  // PS5 extra = 70 * 1 * 30 / 60 = 35 BDT -> Total = 70 BDT
  // PS4 extra = 50 * 1 * 30 / 60 = 25 BDT -> Total = 50 BDT
  const extraPlayers = Math.max(0, players - 1);
  const extraPlayerAmount = (rule.extra_player_hourly_bdt * extraPlayers * billableMinutes) / 60;

  const standardTotal = baseAmount + extraPlayerAmount;

  // 4. Check for matching active continuous hourly packages that are cheaper
  let appliedPackage: PricingPackage | undefined;
  let packageDiscount = 0;
  let candidateTotal = standardTotal;

  const matchingPackages = packages.filter(
    (p) =>
      p.is_active &&
      p.platform === platform &&
      (p.type === 'hourly_pass' || (!p.type && p.minutes === billableMinutes)) &&
      p.minutes === billableMinutes
  );

  for (const pkg of matchingPackages) {
    if (pkg.price_bdt < candidateTotal) {
      packageDiscount = candidateTotal - pkg.price_bdt;
      candidateTotal = pkg.price_bdt;
      appliedPackage = pkg;
    }
  }

  // 5. Round up to nearest unit (default ৳5)
  const finalBdt =
    priceRounding > 1
      ? Math.ceil(candidateTotal / priceRounding) * priceRounding
      : Math.ceil(candidateTotal);

  return {
    billableMinutes,
    baseAmount,
    extraPlayerAmount,
    packageDiscount,
    totalBeforeRounding: candidateTotal,
    finalBdt,
    appliedPackage,
  };
}

/**
 * Arcade coin pricing per FR-PRC-03:
 * Base rate: 3 coins = ৳10
 * Optional packs: 10 coins = ৳30, etc.
 */
export interface ArcadeCoinCalculation {
  coinsRequested: number;
  recommendedCoins: number;
  totalBdt: number;
  explanationEn: string;
  explanationBn: string;
}

export function arcadeTaka(coins: number): ArcadeCoinCalculation {
  if (coins <= 0) {
    return {
      coinsRequested: 0,
      recommendedCoins: 0,
      totalBdt: 0,
      explanationEn: '0 coins',
      explanationBn: '০ টি কয়েন',
    };
  }

  // Base package: 3 coins = ৳10
  // If user requests 10 coins, pack 10 = ৳30
  if (coins === 10) {
    return {
      coinsRequested: 10,
      recommendedCoins: 10,
      totalBdt: 30,
      explanationEn: 'Special Pack: 10 coins for ৳30',
      explanationBn: 'স্পেশাল প্যাক: ১০টি কয়েন মাত্র ৳৩০',
    };
  }

  // Standard rate ceil to multiple of 3
  const setsOf3 = Math.ceil(coins / 3);
  const recommendedCoins = setsOf3 * 3;
  const totalBdt = setsOf3 * 10;

  const noteEn =
    recommendedCoins > coins
      ? `${coins} coins rounded to ${recommendedCoins} coins (3 coins = ৳10)`
      : `${coins} coins = ৳${totalBdt}`;
  const noteBn =
    recommendedCoins > coins
      ? `${coins}টি কয়েনের জন্য ${recommendedCoins}টি পাবেন (৩ কয়েন = ৳১০)`
      : `${coins}টি কয়েন = ৳${totalBdt}`;

  return {
    coinsRequested: coins,
    recommendedCoins,
    totalBdt,
    explanationEn: noteEn,
    explanationBn: noteBn,
  };
}
