import {describe, expect, it} from 'vitest';
import {deepEqual} from './compare-utils';

describe('#deepEqual', () => {
  describe('primitive values', () => {
    it('should return true for identical primitives', () => {
      expect(deepEqual(1, 1)).toBe(true);
      expect(deepEqual('hello', 'hello')).toBe(true);
      expect(deepEqual(true, true)).toBe(true);
      expect(deepEqual(false, false)).toBe(true);
    });

    it('should return false for different primitives', () => {
      expect(deepEqual(1, 2)).toBe(false);
      expect(deepEqual('hello', 'world')).toBe(false);
      expect(deepEqual(true, false)).toBe(false);
      expect(deepEqual(1, '1')).toBe(false);
    });
  });

  describe('null and undefined', () => {
    it('should return true for identical null/undefined values', () => {
      expect(deepEqual(null, null)).toBe(true);
      expect(deepEqual(undefined, undefined)).toBe(true);
    });

    it('should return false for different null/undefined combinations', () => {
      expect(deepEqual(null, undefined)).toBe(false);
      expect(deepEqual(null, 0)).toBe(false);
      expect(deepEqual(undefined, '')).toBe(false);
    });
  });

  describe('arrays', () => {
    it('should return true for identical primitive arrays', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(deepEqual(['a', 'b'], ['a', 'b'])).toBe(true);
      expect(deepEqual([], [])).toBe(true);
    });

    it('should return false for arrays with different lengths', () => {
      expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
      expect(deepEqual([1], [])).toBe(false);
    });

    it('should return false for arrays with different values', () => {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(deepEqual(['a', 'b'], ['a', 'c'])).toBe(false);
    });

    it('should return true for nested arrays that are equal', () => {
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ]
        )
      ).toBe(true);
      expect(deepEqual([['a'], ['b', 'c']], [['a'], ['b', 'c']])).toBe(true);
    });

    it('should return false for nested arrays that are different', () => {
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ]
        )
      ).toBe(false);
      expect(deepEqual([['a'], ['b']], [['a'], ['c']])).toBe(false);
    });
  });

  describe('objects', () => {
    it('should return true for identical simple objects', () => {
      expect(deepEqual({a: 1, b: 2}, {a: 1, b: 2})).toBe(true);
      expect(deepEqual({name: 'test'}, {name: 'test'})).toBe(true);
      expect(deepEqual({}, {})).toBe(true);
    });

    it('should return true for objects with same properties in different order', () => {
      expect(deepEqual({a: 1, b: 2}, {b: 2, a: 1})).toBe(true);
      expect(
        deepEqual({x: 'hello', y: 'world'}, {y: 'world', x: 'hello'})
      ).toBe(true);
    });

    it('should return false for objects with different number of properties', () => {
      expect(deepEqual({a: 1}, {a: 1, b: 2})).toBe(false);
      expect(deepEqual({a: 1, b: 2}, {a: 1})).toBe(false);
    });

    it('should return false for objects with different property values', () => {
      expect(deepEqual({a: 1, b: 2}, {a: 1, b: 3})).toBe(false);
      expect(deepEqual({name: 'test'}, {name: 'other'})).toBe(false);
    });

    it('should return false for objects with different property names', () => {
      expect(deepEqual({a: 1}, {b: 1})).toBe(false);
      expect(deepEqual({name: 'test'}, {title: 'test'})).toBe(false);
    });

    it('should return true for nested objects that are equal', () => {
      const obj1 = {a: {b: 1, c: 2}, d: 3};
      const obj2 = {a: {b: 1, c: 2}, d: 3};
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for nested objects that are different', () => {
      const obj1 = {a: {b: 1, c: 2}, d: 3};
      const obj2 = {a: {b: 1, c: 3}, d: 3};
      expect(deepEqual(obj1, obj2)).toBe(false);
    });
  });

  describe('mixed types', () => {
    it('should return true for objects containing arrays', () => {
      const obj1 = {items: [1, 2, 3], name: 'test'};
      const obj2 = {items: [1, 2, 3], name: 'test'};
      expect(deepEqual(obj1, obj2)).toBe(true);
    });

    it('should return false for objects containing different arrays', () => {
      const obj1 = {items: [1, 2, 3], name: 'test'};
      const obj2 = {items: [1, 2, 4], name: 'test'};
      expect(deepEqual(obj1, obj2)).toBe(false);
    });

    it('should return true for arrays containing objects', () => {
      const arr1 = [{a: 1}, {b: 2}];
      const arr2 = [{a: 1}, {b: 2}];
      expect(deepEqual(arr1, arr2)).toBe(true);
    });

    it('should return false for arrays containing different objects', () => {
      const arr1 = [{a: 1}, {b: 2}];
      const arr2 = [{a: 1}, {b: 3}];
      expect(deepEqual(arr1, arr2)).toBe(false);
    });

    it('should handle complex nested structures', () => {
      const complex1 = {
        users: [
          {id: 1, profile: {name: 'John', settings: {theme: 'dark'}}},
          {id: 2, profile: {name: 'Jane', settings: {theme: 'light'}}},
        ],
        config: {version: '1.0', features: ['search', 'analytics']},
      };
      const complex2 = {
        users: [
          {id: 1, profile: {name: 'John', settings: {theme: 'dark'}}},
          {id: 2, profile: {name: 'Jane', settings: {theme: 'light'}}},
        ],
        config: {version: '1.0', features: ['search', 'analytics']},
      };
      expect(deepEqual(complex1, complex2)).toBe(true);

      const complex3 = {
        ...complex2,
        config: {version: '1.1', features: ['search', 'analytics']},
      };
      expect(deepEqual(complex1, complex3)).toBe(false);
    });
  });
});
