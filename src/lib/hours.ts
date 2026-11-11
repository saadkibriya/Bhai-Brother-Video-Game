export interface DayHours {
  weekday: number; // 0 = Sunday
  label: string;
  short: string;
  open: string;
  close: string; // may pass midnight
}

/** Saturday-first, the way the week is read in Dhaka. */
export const HOURS: DayHours[] = [
  { weekday: 6, label: 'Saturday', short: 'Sat', open: '14:00', close: '23:00' },
  { weekday: 0, label: 'Sunday', short: 'Sun', open: '14:00', close: '23:00' },
  { weekday: 1, label: 'Monday', short: 'Mon', open: '14:00', close: '23:00' },
  { weekday: 2, label: 'Tuesday', short: 'Tue', open: '14:00', close: '23:00' },
  { weekday: 3, label: 'Wednesday', short: 'Wed', open: '14:00', close: '23:00' },
  { weekday: 4, label: 'Thursday', short: 'Thu', open: '14:00', close: '01:00' },
  { weekday: 5, label: 'Friday', short: 'Fri', open: '15:00', close: '00:00' },
];

export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, '0')} ${suffix}` : `${hour} ${suffix}`;
}

export function hoursFor(weekday: number): DayHours {
  return HOURS.find((day) => day.weekday === weekday) ?? HOURS[0];
}

export function hoursSummary(day: DayHours): string {
  return `${formatTime(day.open)} – ${formatTime(day.close)}`;
}

export interface DhakaNow {
  iso: string;
  weekday: number;
  minutes: number;
}

const WEEKDAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Current wall-clock time in Asia/Dhaka, independent of the visitor's timezone. */
export function dhakaNow(now: Date = new Date()): DhakaNow {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(now);

  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const hour = Number(part('hour')) % 24;

  return {
    iso: `${part('year')}-${part('month')}-${part('day')}`,
    weekday: WEEKDAY_KEYS.indexOf(part('weekday')),
    minutes: hour * 60 + Number(part('minute')),
  };
}

export interface OpenStatus {
  open: boolean;
  closingSoon: boolean;
  label: string;
  detail: string;
}

const closeAfterMidnight = (close: number, open: number) => (close <= open ? close + 1440 : close);

export function openStatus(now: Date = new Date()): OpenStatus {
  const { weekday, minutes } = dhakaNow(now);
  const today = hoursFor(weekday);
  const yesterday = hoursFor((weekday + 6) % 7);

  // Thursday's session runs into Friday morning.
  const yOpen = minutesOf(yesterday.open);
  const yClose = closeAfterMidnight(minutesOf(yesterday.close), yOpen);
  if (yClose > 1440 && minutes < yClose - 1440) {
    const left = yClose - 1440 - minutes;
    return {
      open: true,
      closingSoon: left <= 30,
      label: left <= 30 ? 'Closing soon' : 'Open now',
      detail: `till ${formatTime(yesterday.close)}`,
    };
  }

  const open = minutesOf(today.open);
  const close = closeAfterMidnight(minutesOf(today.close), open);

  if (minutes < open) {
    return { open: false, closingSoon: false, label: 'Closed', detail: `opens ${formatTime(today.open)}` };
  }

  if (minutes < close) {
    const left = close - minutes;
    return {
      open: true,
      closingSoon: left <= 30,
      label: left <= 30 ? 'Closing soon' : 'Open now',
      detail: `till ${formatTime(today.close)}`,
    };
  }

  const tomorrow = hoursFor((weekday + 1) % 7);
  return { open: false, closingSoon: false, label: 'Closed', detail: `opens ${formatTime(tomorrow.open)} tomorrow` };
}
