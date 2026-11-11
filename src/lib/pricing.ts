export type Platform = 'ps5' | 'ps4';

/** Station rate in taka per hour. One station, up to 4 controllers — not per player. */
export const RATES: Record<Platform, number> = {
  ps5: 70,
  ps4: 50,
};

/** Cheaper 3-hour pass, applied automatically when it beats the hourly rate. */
export const SQUAD_PASS: Record<Platform, { minutes: number; price: number }> = {
  ps5: { minutes: 180, price: 190 },
  ps4: { minutes: 180, price: 135 },
};

export const DURATIONS = [60, 90, 120, 180] as const;

export interface Quote {
  minutes: number;
  standard: number;
  total: number;
  pass: string | null;
  saved: number;
}

export const round5 = (amount: number) => Math.ceil(amount / 5) * 5;

/** Sessions bill in 30-minute steps, with a 30-minute minimum. */
export const billableMinutes = (minutes: number) => Math.max(30, Math.ceil(minutes / 30) * 30);

export function quote(platform: Platform, minutes: number): Quote {
  const billable = billableMinutes(minutes);
  const standard = round5((RATES[platform] * billable) / 60);
  const squad = SQUAD_PASS[platform];

  if (billable === squad.minutes && standard > squad.price) {
    return {
      minutes: billable,
      standard,
      total: squad.price,
      pass: '3-hour squad pass',
      saved: standard - squad.price,
    };
  }

  return { minutes: billable, standard, total: standard, pass: null, saved: 0 };
}

export function formatTaka(amount: number): string {
  return `৳${Math.round(amount).toLocaleString('en-IN')}`;
}

export function durationLabel(minutes: number): string {
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hr` : `${hours} hr`;
}
