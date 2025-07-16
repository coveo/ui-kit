import {describe, expect, it} from 'vitest';
import {intersection} from './set';

describe('intersection', () => {
  it('should return the common elements of two sets', () => {
    const setA = new Set([1, 2, 3]);
    const setB = new Set([2, 3, 4]);
    const result = intersection(setA, setB);
    expect(result).toEqual(new Set([2, 3]));
  });

  it('should return an empty set when there are no common elements', () => {
    const setA = new Set([1, 2, 3]);
    const setB = new Set([4, 5, 6]);
    const result = intersection(setA, setB);
    expect(result).toEqual(new Set());
  });

  it('should return an empty set when one set is empty', () => {
    const setA = new Set();
    const setB = new Set([1, 2, 3]);
    const result = intersection(setA, setB);
    expect(result).toEqual(new Set());
  });

  it('should return an empty set when both sets are empty', () => {
    const setA = new Set();
    const setB = new Set();
    const result = intersection(setA, setB);
    expect(result).toEqual(new Set());
  });
});
