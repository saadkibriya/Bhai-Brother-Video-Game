/**
 * Formatting Utilities for Currency, Digits, and Dates in English & Bangla
 */

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaDigits(input: number | string): string {
  return String(input).replace(/\d/g, (d) => BANGLA_DIGITS[Number(d)]);
}

export function formatBdt(amount: number, lang: 'en' | 'bn' = 'en'): string {
  const rounded = Math.round(amount);
  if (lang === 'bn') {
    return `৳${toBanglaDigits(rounded.toLocaleString('en-IN'))}`;
  }
  return `৳${rounded.toLocaleString('en-IN')}`;
}

export function formatDurationMinutes(minutes: number, lang: 'en' | 'bn' = 'en'): string {
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (lang === 'bn') {
    if (hours > 0 && remainingMins > 0) {
      return `${toBanglaDigits(hours)} ঘণ্টা ${toBanglaDigits(remainingMins)} মিনিট`;
    }
    if (hours > 0) {
      return `${toBanglaDigits(hours)} ঘণ্টা`;
    }
    return `${toBanglaDigits(remainingMins)} মিনিট`;
  }

  if (hours > 0 && remainingMins > 0) {
    return `${hours} hr ${remainingMins} min`;
  }
  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${remainingMins} min`;
}
