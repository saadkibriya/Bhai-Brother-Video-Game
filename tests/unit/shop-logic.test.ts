import { describe, expect, test } from 'bun:test';
import { DURATIONS, billableMinutes, durationLabel, quote, round5 } from '../../src/lib/pricing';
import { dhakaNow, formatTime, openStatus } from '../../src/lib/hours';
import {
  buildBookingMessage,
  dayLabel,
  fits,
  labelForMinutes,
  normalizePhone,
  slotsFor,
  upcomingDays,
  whatsappUrl,
} from '../../src/lib/booking';

describe('pricing', () => {
  test('bills in half hours with a 30 minute minimum', () => {
    expect(billableMinutes(10)).toBe(30);
    expect(billableMinutes(31)).toBe(60);
    expect(billableMinutes(100)).toBe(120);
    expect(round5(101)).toBe(105);
  });

  test('uses the station rate, not a per-player rate', () => {
    expect(quote('ps5', 30).total).toBe(35);
    expect(quote('ps4', 30).total).toBe(25);
    expect(quote('ps5', 120).total).toBe(140);
    expect(quote('ps4', 120).total).toBe(100);
  });

  test('applies the 3-hour squad pass when it is cheaper', () => {
    const ps5 = quote('ps5', 180);
    expect(ps5.total).toBe(190);
    expect(ps5.pass).toBe('3-hour squad pass');
    expect(ps5.saved).toBe(20);

    const ps4 = quote('ps4', 180);
    expect(ps4.total).toBe(135);
    expect(ps4.saved).toBe(15);
  });

  test('does not invent a pass discount for other lengths', () => {
    expect(quote('ps5', 150).pass).toBeNull();
  });

  test('offers a 30 minute session alongside the longer blocks', () => {
    expect(DURATIONS).toContain(30);
    expect(durationLabel(30)).toBe('30 min');
    expect(quote('ps5', 30)).toMatchObject({ minutes: 30, total: 35 });
    expect(quote('ps4', 30).total).toBe(25);
  });
});

describe('dhaka hours', () => {
  test('formats shop times', () => {
    expect(formatTime('14:00')).toBe('2 PM');
    expect(formatTime('22:30')).toBe('10:30 PM');
    expect(formatTime('00:00')).toBe('12 AM');
    expect(formatTime('01:00')).toBe('1 AM');
  });

  test('reads the clock in Dhaka regardless of the host timezone', () => {
    const now = dhakaNow(new Date('2026-11-11T09:00:00Z')); // 15:00 in Dhaka, Wednesday
    expect(now.iso).toBe('2026-11-11');
    expect(now.weekday).toBe(3);
    expect(now.minutes).toBe(900);
  });

  test('reports open, closed and past-midnight sessions', () => {
    expect(openStatus(new Date('2026-11-11T09:00:00Z')).open).toBe(true);
    expect(openStatus(new Date('2026-11-11T03:00:00Z')).detail).toBe('opens 2 PM');

    // 00:30 on Friday — Thursday's session is still running.
    const late = openStatus(new Date('2026-11-12T18:30:00Z'));
    expect(late.open).toBe(true);
    expect(late.detail).toBe('till 1 AM');

    // 01:30 on Friday — Thursday has closed, Friday opens at 3 PM.
    expect(openStatus(new Date('2026-11-12T19:30:00Z')).open).toBe(false);
  });
});

describe('slots', () => {
  const longAgo = new Date('2026-01-01T00:00:00Z');

  test('only offers starts that fit the closing time', () => {
    const saturday = slotsFor('2026-11-14', longAgo);
    expect(saturday[0]).toBe(14 * 60);
    expect(saturday.at(-1)).toBe(22 * 60);
    expect(saturday).toHaveLength(17);
    expect(labelForMinutes(saturday.at(-1)!)).toBe('10 PM');
  });

  test('handles Friday midnight and Thursday past-midnight closes', () => {
    expect(labelForMinutes(slotsFor('2026-11-13', longAgo).at(-1)!)).toBe('11 PM');
    expect(labelForMinutes(slotsFor('2026-11-12', longAgo).at(-1)!)).toBe('12 AM');
  });

  test('drops today’s slots once they are less than 30 minutes away', () => {
    // 23:00 in Dhaka on Wednesday — the shop closes at 23:00, so nothing is left.
    expect(slotsFor('2026-11-11', new Date('2026-11-11T17:00:00Z'))).toEqual([]);
  });

  test('checks a session fits before closing', () => {
    expect(fits('2026-11-14', 22 * 60, 60)).toBe(true);
    expect(fits('2026-11-14', 22 * 60, 120)).toBe(false);
  });

  test('labels days the way the shop says them', () => {
    expect(dayLabel('2026-11-14')).toBe('Sat 14 Nov');
  });
});

describe('bookings', () => {
  test('builds ten consecutive Dhaka days', () => {
    const days = upcomingDays(10, new Date('2026-11-11T09:00:00Z'));
    expect(days).toHaveLength(10);
    expect(days[0]).toMatchObject({ iso: '2026-11-11', isToday: true, weekday: 3 });
    expect(days[1].iso).toBe('2026-11-12');
    expect(days.filter((day) => day.isToday)).toHaveLength(1);
  });

  test('accepts Bangladeshi mobile numbers in the usual formats', () => {
    expect(normalizePhone('01712-345678')).toBe('8801712345678');
    expect(normalizePhone('+880 1712 345678')).toBe('8801712345678');
    expect(normalizePhone('01712345678')).toBe('8801712345678');
    expect(normalizePhone('0123456789')).toBeNull();
    expect(normalizePhone('01712')).toBeNull();
  });

  test('writes a message the counter can act on', () => {
    const message = buildBookingMessage({
      platform: 'ps5',
      dateIso: '2026-11-14',
      start: 18 * 60,
      duration: 120,
      players: 2,
      name: 'Rafi',
      phone: '01712-345678',
      note: 'FC 26',
    });

    expect(message).toContain('Rafi');
    expect(message).toContain('PS5 · 2 players');
    expect(message).toContain('Sat 14 Nov, 6 PM – 8 PM');
    expect(message).toContain('৳140');
    expect(message).toContain('FC 26');
    expect(message).not.toContain('undefined');
  });

  test('encodes the WhatsApp deep link', () => {
    const url = whatsappUrl('Hello & welcome');
    expect(url.startsWith('https://wa.me/8801775533852?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Hello & welcome');
  });
});
