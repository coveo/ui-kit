import {describe, it, expect} from 'vitest';
import {deepEqual} from './deep-equal.js';

describe('deepEqual', () => {
  describe('primitives', () => {
    it('returns true for identical primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('a', 'a')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it('returns false for different primitives', () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('a', 'b')).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
      expect(deepEqual(null, undefined)).toBe(false);
    });
  });

  describe('arrays', () => {
    it('returns true for equal arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('returns false for arrays with different lengths', () => {
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('returns false for arrays with different elements', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('handles nested arrays', () => {
      expect(deepEqual([[1, 2], [3]], [[1, 2], [3]])).toBe(true);
      expect(deepEqual([[1, 2], [3]], [[1, 2], [4]])).toBe(false);
    });
  });

  describe('objects', () => {
    it('returns true for equal objects', () => {
      expect(deepEqual({a: 1, b: 2}, {a: 1, b: 2})).toBe(true);
    });

    it('returns true regardless of key insertion order', () => {
      expect(deepEqual({a: 1, b: 2}, {b: 2, a: 1})).toBe(true);
    });

    it('returns false for objects with different values', () => {
      expect(deepEqual({a: 1, b: 2}, {a: 1, b: 3})).toBe(false);
    });

    it('returns false for objects with different keys', () => {
      expect(deepEqual({a: 1, b: 2}, {a: 1, c: 2})).toBe(false);
    });

    it('returns false for objects with different key counts', () => {
      expect(deepEqual({a: 1}, {a: 1, b: 2})).toBe(false);
    });

    it('handles nested objects with different key order', () => {
      const a = {outer: {x: 1, y: 2}, z: 3};
      const b = {z: 3, outer: {y: 2, x: 1}};
      expect(deepEqual(a, b)).toBe(true);
    });
  });

  describe('mixed types', () => {
    it('returns false when comparing object to array', () => {
      expect(deepEqual({0: 'a', 1: 'b'}, ['a', 'b'])).toBe(false);
    });

    it('returns false when comparing object to primitive', () => {
      expect(deepEqual({a: 1}, 1)).toBe(false);
    });

    it('returns false when comparing null to object', () => {
      expect(deepEqual(null, {a: 1})).toBe(false);
    });
  });

  describe('excludeKeys option', () => {
    it('ignores excluded keys in comparison', () => {
      const a = {by: 'field', field: 'price', displayName: 'Price'};
      const b = {by: 'field', field: 'price', displayName: 'Cost'};
      expect(deepEqual(a, b, {excludeKeys: ['displayName']})).toBe(true);
    });

    it('still compares non-excluded keys', () => {
      const a = {by: 'field', field: 'price', displayName: 'Price'};
      const b = {by: 'field', field: 'name', displayName: 'Price'};
      expect(deepEqual(a, b, {excludeKeys: ['displayName']})).toBe(false);
    });

    it('excludes keys at nested levels', () => {
      const a = {sort: {by: 'field', displayName: 'A'}};
      const b = {sort: {by: 'field', displayName: 'B'}};
      expect(deepEqual(a, b, {excludeKeys: ['displayName']})).toBe(true);
    });

    it('handles excluded key present in only one object', () => {
      const a = {by: 'field', field: 'price'};
      const b = {by: 'field', field: 'price', displayName: 'Price'};
      expect(deepEqual(a, b, {excludeKeys: ['displayName']})).toBe(true);
    });
  });
});
