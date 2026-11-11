import { describe, expect, test } from 'bun:test';
import { elapsedLabel, statusLabel } from '../../src/lib/stations';

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
