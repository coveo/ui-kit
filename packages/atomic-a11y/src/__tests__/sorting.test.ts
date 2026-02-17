import {describe, expect, it} from 'vitest';
import {compareByName, compareByNumericId} from '../shared/sorting.js';

describe('compareByNumericId', () => {
  it('should sort numeric IDs with numeric comparison', () => {
    const ids = ['1.10.1', '1.2.1', '1.1.1'];
    const sorted = ids.sort(compareByNumericId);
    expect(sorted).toEqual(['1.1.1', '1.2.1', '1.10.1']);
  });

  it('should return negative when first ID is less than second', () => {
    expect(compareByNumericId('1.1.1', '1.2.1')).toBeLessThan(0);
  });

  it('should correctly sort numeric IDs as numbers, not lexicographic', () => {
    const result = compareByNumericId('1.2.1', '1.10.1');
    expect(result).toBeLessThan(0);
  });

  it('should return positive when first ID is greater than second', () => {
    expect(compareByNumericId('2.1.1', '1.4.3')).toBeGreaterThan(0);
  });

  it('should return zero when IDs are equal', () => {
    expect(compareByNumericId('1.2.1', '1.2.1')).toBe(0);
  });

  it('should handle multi-digit numeric parts', () => {
    const ids = ['1.100.1', '1.20.1', '1.3.1'];
    const sorted = ids.sort(compareByNumericId);
    expect(sorted).toEqual(['1.3.1', '1.20.1', '1.100.1']);
  });
});

describe('compareByName', () => {
  it('should sort names alphabetically', () => {
    const names = ['atomic-c', 'atomic-a', 'atomic-b'];
    const sorted = names.sort(compareByName);
    expect(sorted).toEqual(['atomic-a', 'atomic-b', 'atomic-c']);
  });

  it('should return negative when first name is less than second', () => {
    expect(compareByName('atomic-a', 'atomic-b')).toBeLessThan(0);
  });

  it('should return positive when first name is greater than second', () => {
    expect(compareByName('atomic-z', 'atomic-a')).toBeGreaterThan(0);
  });

  it('should return zero when names are equal', () => {
    expect(compareByName('atomic-button', 'atomic-button')).toBe(0);
  });

  it('should handle case-insensitive comparison (locale-aware)', () => {
    const result = compareByName('Atomic-A', 'atomic-b');
    expect(result).toBeLessThan(0);
  });

  it('should sort multiple names consistently', () => {
    const names = ['search', 'button', 'atomic', 'checkbox'];
    const sorted = names.sort(compareByName);
    expect(sorted).toEqual(['atomic', 'button', 'checkbox', 'search']);
  });
});
