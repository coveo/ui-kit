import {describe, expect, it} from 'vitest';
import {isNonNegativeNumber, isOneOf} from './validation.js';

describe('validation guards', () => {
  it('recognizes allowlisted strings', () => {
    const allowed = ['first', 'second'] as const;

    expect(isOneOf('first', allowed)).toBe(true);
    expect(isOneOf('other', allowed)).toBe(false);
    expect(isOneOf(1, allowed)).toBe(false);
  });

  it('recognizes finite non-negative numbers', () => {
    expect(isNonNegativeNumber(0)).toBe(true);
    expect(isNonNegativeNumber(1.5)).toBe(true);
    expect(isNonNegativeNumber(-1)).toBe(false);
    expect(isNonNegativeNumber(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isNonNegativeNumber('1')).toBe(false);
  });
});
