import { describe, expect, test } from 'bun:test';
import { alertsFor, elapsedLabel, remainingLabel, statusLabel } from '../../src/lib/stations';

describe('station timers', () => {
  const start = 1_700_000_000_000;

  test('counts a running session up in minutes and seconds', () => {
    expect(elapsedLabel(start, start)).toBe('00:00');
    expect(elapsedLabel(start, start + 5_000)).toBe('00:05');
    expect(elapsedLabel(start, start + 65_000)).toBe('01:05');
    expect(elapsedLabel(start, start + 59 * 60_000 + 59_000)).toBe('59:59');
  });

  test('switches to hours once a session passes an hour', () => {
    expect(elapsedLabel(start, start + 60 * 60_000)).toBe('1:00:00');
    expect(elapsedLabel(start, start + (62 * 60 + 5) * 1000)).toBe('1:02:05');
  });

  test('never goes negative if the clocks disagree', () => {
    expect(elapsedLabel(start, start - 4_000)).toBe('00:00');
  });

  test('labels the three station states for customers', () => {
    expect(statusLabel('free')).toBe('Free');
    expect(statusLabel('busy')).toBe('In use');
    expect(statusLabel('blocked')).toBe('Blocked');
  });
});

describe('session alerts', () => {
  const minute = 60_000;
  const end = 1_700_000_000_000;

  test('stays quiet until ten minutes remain', () => {
    expect(alertsFor(end, end - 11 * minute, [])).toEqual([]);
    expect(alertsFor(end, end - 10 * minute, [])).toEqual(['ten']);
  });

  test('fires the five minute and end alerts as the clock runs down', () => {
    expect(alertsFor(end, end - 5 * minute, ['ten'])).toEqual(['five']);
    expect(alertsFor(end, end - minute, ['ten', 'five'])).toEqual([]);
    expect(alertsFor(end, end, ['ten', 'five'])).toEqual(['end']);
    expect(alertsFor(end, end + 3 * minute, ['ten', 'five'])).toEqual(['end']);
  });

  test('never repeats an alert already shown for the session', () => {
    expect(alertsFor(end, end - 4 * minute, ['ten', 'five'])).toEqual([]);
    expect(alertsFor(end, end + minute, ['ten', 'five', 'end'])).toEqual([]);
  });

  test('catches up if the panel was closed through a threshold', () => {
    expect(alertsFor(end, end - 4 * minute, [])).toEqual(['ten', 'five']);
  });

  test('reads the remaining time the way the counter says it', () => {
    expect(remainingLabel(end, end - 38 * minute)).toBe('38 min left');
    expect(remainingLabel(end, end - 30_000)).toBe('1 min left');
    expect(remainingLabel(end, end)).toBe('Time is up');
    expect(remainingLabel(end, end + minute)).toBe('Time is up');
  });
});
