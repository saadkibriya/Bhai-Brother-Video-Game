import { SHOP } from '../data/contact';
import { HOURS, dhakaNow, formatTime, hoursFor, minutesOf } from './hours';
import { quote, type Platform } from './pricing';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (value: number) => String(value).padStart(2, '0');

export interface DayOption {
  iso: string;
  weekday: number;
  day: number;
  month: string;
  weekdayShort: string;
  isToday: boolean;
}

export function upcomingDays(count = 10, now: Date = new Date()): DayOption[] {
  const today = dhakaNow(now);
  const [year, month, date] = today.iso.split('-').map(Number);

  return Array.from({ length: count }, (_, offset) => {
    const day = new Date(Date.UTC(year, month - 1, date + offset));
    return {
      iso: `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`,
      weekday: day.getUTCDay(),
      day: day.getUTCDate(),
      month: MONTHS[day.getUTCMonth()],
      weekdayShort: WEEKDAYS[day.getUTCDay()],
      isToday: offset === 0,
    };
  });
}

export function weekdayOfIso(iso: string): number {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, date)).getUTCDay();
}

/** Opening window for a date, in minutes from midnight; close may exceed 1440. */
export function windowFor(iso: string): { open: number; close: number } {
  const day = hoursFor(weekdayOfIso(iso));
  const open = minutesOf(day.open);
  const close = minutesOf(day.close);
  return { open, close: close <= open ? close + 1440 : close };
}

/** Slot start times for a date, already dropping times that are too close to now. */
export function slotsFor(iso: string, now: Date = new Date()): number[] {
  const { open, close } = windowFor(iso);
  const today = dhakaNow(now);
  const earliest = iso === today.iso ? today.minutes + 30 : 0;

  const slots: number[] = [];
  for (let start = open; start + 60 <= close; start += 30) {
    if (start >= earliest) slots.push(start);
  }
  return slots;
}

export function labelForMinutes(minutes: number): string {
  const hh = Math.floor((minutes % 1440) / 60);
  const mm = minutes % 60;
  return formatTime(`${pad(hh)}:${pad(mm)}`);
}

export function endLabel(start: number, duration: number): string {
  return labelForMinutes(start + duration);
}

export function fits(iso: string, start: number, duration: number): boolean {
  return start + duration <= windowFor(iso).close;
}

export function durationChoices(iso: string, start: number): number[] {
  return [60, 90, 120, 180].filter((duration) => fits(iso, start, duration));
}

export function dayLabel(iso: string): string {
  const [year, month, date] = iso.split('-').map(Number);
  const day = new Date(Date.UTC(year, month - 1, date));
  return `${WEEKDAYS[day.getUTCDay()]} ${day.getUTCDate()} ${MONTHS[day.getUTCMonth()]}`;
}

export function normalizePhone(raw: string): string | null {
  const cleaned = raw.trim().replace(/[\s\-()]/g, '');
  const match = cleaned.match(/^(?:\+?88)?(01[3-9]\d{8})$/);
  return match ? `88${match[1]}` : null;
}

export interface BookingRequest {
  platform: Platform;
  dateIso: string;
  start: number;
  duration: number;
  players: number;
  name: string;
  phone: string;
  note?: string;
}

export function buildBookingMessage(request: BookingRequest): string {
  const estimate = quote(request.platform, request.duration, request.players);
  const priceLine = estimate.pass
    ? `৳${estimate.total} for ${request.players} (${estimate.pass} — saves ৳${estimate.saved})`
    : `৳${estimate.total} for ${request.players} (৳${estimate.perPerson} each)`;

  const lines = [
    `Booking request — ${SHOP.fullName}`,
    '',
    `Name: ${request.name}`,
    `Phone: ${request.phone}`,
    `Station: ${request.platform.toUpperCase()} · ${request.players} ${request.players === 1 ? 'player' : 'players'}`,
    `When: ${dayLabel(request.dateIso)}, ${labelForMinutes(request.start)} – ${endLabel(request.start, request.duration)}`,
    `Estimate: ${priceLine}`,
  ];

  if (request.note?.trim()) lines.push(`Note: ${request.note.trim()}`);

  lines.push('', 'Sent from the Bhai Brother website.');
  return lines.join('\n');
}

export function whatsappUrl(message: string): string {
  return `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(message)}`;
}

export { HOURS };
