import { describe, expect, test } from 'bun:test';
import { codeProblem, normalizeCode, passwordProblem, usernameProblem } from '../../src/lib/credentials';

describe('admin credentials', () => {
  test('accepts plain usernames and normalises case and spaces', () => {
    expect(usernameProblem('rafi')).toBeNull();
    expect(usernameProblem('counter.2')).toBeNull();
    expect(usernameProblem('night-shift_1')).toBeNull();
    expect(usernameProblem('   ')).toBe('Pick a username.');
    expect(usernameProblem('ab')).not.toBeNull();
    expect(usernameProblem('has space')).not.toBeNull();
    expect(usernameProblem('a'.repeat(25))).not.toBeNull();
  });

  test('keeps passwords at eight characters or more', () => {
    expect(passwordProblem('short')).toBe('Use at least 8 characters.');
    expect(passwordProblem('longenough')).toBeNull();
    expect(passwordProblem('x'.repeat(201))).not.toBeNull();
  });

  test('only keeps six digits in a reset code', () => {
    expect(normalizeCode('12 34-56')).toBe('123456');
    expect(normalizeCode('1234567')).toBe('123456');
    expect(codeProblem('123456')).toBeNull();
    expect(codeProblem('12345')).not.toBeNull();
    expect(codeProblem('abcdef')).not.toBeNull();
  });
});
