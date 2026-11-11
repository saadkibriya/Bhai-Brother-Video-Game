export type Platform = 'ps5' | 'ps4';

/** Per person, per hour. */
export const RATES: Record<Platform, number> = {
  ps5: 70,
  ps4: 50,
};

/** Per person for a 30-minute session. */
export const HALF_HOUR: Record<Platform, number> = {
  ps5: 40,
  ps4: 30,
};

/** Cheaper 3-hour pass, per person, applied automatically when it beats the hourly rate. */
export const SQUAD_PASS: Record<Platform, { minutes: number; price: number }> = {
  ps5: { minutes: 180, price: 190 },
  ps4: { minutes: 180, price: 135 },
};

export const DURATIONS = [30, 60, 90, 120, 180] as const;

export interface Quote {
  minutes: number;
  players: number;
  perPerson: number;
  standard: number;
  total: number;
  pass: string | null;
  saved: number;
}

export const round5 = (amount: number) => Math.ceil(amount / 5) * 5;

/** Sessions bill in 30-minute steps, with a 30-minute minimum. */
export const billableMinutes = (minutes: number) => Math.max(30, Math.ceil(minutes / 30) * 30);

export function quote(platform: Platform, minutes: number, players = 1): Quote {
  const billable = billableMinutes(minutes);
  const count = Math.min(4, Math.max(1, Math.round(players)));

  // Half hours have their own rate; longer sessions use the hourly rate.
  const perPerson =
    billable === 30 ? HALF_HOUR[platform] : round5((RATES[platform] * billable) / 60);

  const standard = perPerson * count;
  const squad = SQUAD_PASS[platform];

  if (billable === squad.minutes && perPerson > squad.price) {
    return {
      minutes: billable,
      players: count,
      perPerson,
      standard,
      total: squad.price * count,
      pass: '3-hour squad pass',
      saved: (perPerson - squad.price) * count,
    };
  }

  return {
    minutes: billable,
    players: count,
    perPerson,
    standard,
    total: standard,
    pass: null,
    saved: 0,
  };
}

export function formatTaka(amount: number): string {
  return `৳${Math.round(amount).toLocaleString('en-IN')}`;
}

export function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hr` : `${hours} hr`;
}
