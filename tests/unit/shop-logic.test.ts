/**
 * Comprehensive Unit Test Suite per qa-test.md Section 4
 */

import { describe, it, expect } from 'vitest';
import { estimatePrice, arcadeTaka } from '../../src/lib/pricing';
import { getOpenStatus, getDhakaTimeParts, DEFAULT_WEEKLY_HOURS } from '../../src/lib/hours';
import { normalizePhone, maskPhone, syntheticEmail } from '../../src/lib/phone';
import { tierFor, getTierProgress } from '../../src/lib/tiers';
import { getSafeDisplayName } from '../../src/lib/displayName';
import { formatBdt, toBanglaDigits, formatDurationMinutes } from '../../src/lib/format';

describe('Pricing Logic (FR-PRC-01, FR-PRC-03, FR-PRC-05)', () => {
  it('U-PRC-01: PS5 ৳70/h, 60 min, 1 player -> ৳70', () => {
    const res = estimatePrice({ platform: 'ps5', durationMinutes: 60, players: 1 });
    expect(res.finalBdt).toBe(70);
  });

  it('U-PRC-02: PS5 60 min, 2 players -> ৳140', () => {
    const res = estimatePrice({ platform: 'ps5', durationMinutes: 60, players: 2 });
    expect(res.finalBdt).toBe(140);
  });

  it('U-PRC-03: PS4 ৳50/h, 60 min, 1 player -> ৳50', () => {
    const res = estimatePrice({ platform: 'ps4', durationMinutes: 60, players: 1 });
    expect(res.finalBdt).toBe(50);
  });

  it('U-PRC-04: PS4 60 min, 2 players -> ৳100', () => {
    const res = estimatePrice({ platform: 'ps4', durationMinutes: 60, players: 2 });
    expect(res.finalBdt).toBe(100);
  });

  it('U-PRC-06: Rounding nearest ৳5', () => {
    const res = estimatePrice({
      platform: 'ps5',
      durationMinutes: 30,
      players: 1,
      priceRounding: 5,
    });
    expect(res.finalBdt % 5).toBe(0);
  });

  it('U-PRC-07: Arcade 3 coins -> ৳10', () => {
    const res = arcadeTaka(3);
    expect(res.totalBdt).toBe(10);
  });

  it('U-PRC-08: Arcade 4 coins -> rounds up to 6 coins -> ৳20', () => {
    const res = arcadeTaka(4);
    expect(res.recommendedCoins).toBe(6);
    expect(res.totalBdt).toBe(20);
  });

  it('U-PRC-09: Arcade Special Pack 10 coins -> ৳30', () => {
    const res = arcadeTaka(10);
    expect(res.totalBdt).toBe(30);
  });
});

describe('Phone Normalization (FR-ACC-02)', () => {
  it('U-PHN-01: Accepts various formats and normalizes to 8801XXXXXXXXX', () => {
    expect(normalizePhone('01712-345678').normalized).toBe('8801712345678');
    expect(normalizePhone('+8801712345678').normalized).toBe('8801712345678');
    expect(normalizePhone('8801712345678').normalized).toBe('8801712345678');
    expect(normalizePhone('01999 888777').normalized).toBe('8801999888777');
  });

  it('U-PHN-02: Rejects invalid phone numbers', () => {
    expect(normalizePhone('01212345678').isValid).toBe(false); // 012 is not valid in BD
    expect(normalizePhone('017123456').isValid).toBe(false);   // Too short
    expect(normalizePhone('abc').isValid).toBe(false);
  });

  it('Masking: Correctly masks phone for privacy', () => {
    expect(maskPhone('01711223482')).toBe('••• 482');
  });

  it('Synthetic Email: generates valid format', () => {
    expect(syntheticEmail('8801711223482')).toBe('8801711223482@members.bhaibrother.app');
  });
});

describe('Tiers & Gamification (FR-LDB-03)', () => {
  it('U-TIR-01: Maps completed sessions to correct tier', () => {
    expect(tierFor(0).name).toBe('Rookie');
    expect(tierFor(4).name).toBe('Rookie');
    expect(tierFor(5).name).toBe('Bronze');
    expect(tierFor(15).name).toBe('Silver');
    expect(tierFor(30).name).toBe('Gold');
    expect(tierFor(60).name).toBe('Platinum');
    expect(tierFor(100).name).toBe('Diamond');
  });

  it('Calculates progress percentage accurately', () => {
    const p = getTierProgress(5); // Bronze is 5 to 14, next is Silver (15)
    expect(p.currentTier.name).toBe('Bronze');
    expect(p.nextTier?.name).toBe('Silver');
    expect(p.sessionsNeededForNext).toBe(10);
  });
});

describe('Display Name Privacy (FR-LDB-04)', () => {
  it('U-NAM-01: Shows nickname if available', () => {
    expect(
      getSafeDisplayName({
        fullName: 'Rafi Ahmed',
        nickname: 'SniperRafi',
        phone: '8801711223482',
      })
    ).toBe('SniperRafi');
  });

  it('U-NAM-02: Fallbacks to FirstName ••• Last3Digits if no nickname', () => {
    expect(
      getSafeDisplayName({
        fullName: 'Rafi Ahmed',
        nickname: '',
        phone: '8801711223482',
      })
    ).toBe('Rafi ••• 482');
  });
});

describe('Formatting & Digits (FR-I18N-01)', () => {
  it('U-I18N-01: Converts English numbers to Bangla digits', () => {
    expect(toBanglaDigits(1250)).toBe('১২৫০');
  });

  it('Formats BDT currency in English & Bangla', () => {
    expect(formatBdt(120, 'en')).toBe('৳120');
    expect(formatBdt(120, 'bn')).toBe('৳১২০');
  });

  it('Formats duration strings correctly', () => {
    expect(formatDurationMinutes(60, 'en')).toBe('1 hr');
    expect(formatDurationMinutes(90, 'en')).toBe('1 hr 30 min');
    expect(formatDurationMinutes(60, 'bn')).toBe('১ ঘণ্টা');
  });
});
