import {beforeEach, describe, expect, it} from 'vitest';
import {EntityCache} from '../../src/core/entity-cache.js';

describe('EntityCache', () => {
  let cache: EntityCache;

  beforeEach(() => {
    cache = new EntityCache();
  });

  describe('set() and get()', () => {
    it('should store and retrieve value with single key', () => {
      cache.set('component:SearchBox', 123);
      expect(cache.get('component:SearchBox')).toBe(123);
    });

    it('should store value with multiple keys', () => {
      cache.set(
        [
          'controller:SearchBox',
          'controller:buildSearchBox',
          'controller:SearchBox:search',
        ],
        456
      );

      expect(cache.get('controller:SearchBox')).toBe(456);
      expect(cache.get('controller:buildSearchBox')).toBe(456);
      expect(cache.get('controller:SearchBox:search')).toBe(456);
    });

    it('should return undefined for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeUndefined();
    });

    it('should fallback through array of keys when getting', () => {
      cache.set('controller:SearchBox:search', 789);

      // Try specific key first, fallback to less specific
      expect(
        cache.get([
          'controller:SearchBox:search:facets',
          'controller:SearchBox:search',
          'controller:SearchBox',
        ])
      ).toBe(789);
    });

    it('should return undefined if none of the keys exist', () => {
      expect(
        cache.get([
          'controller:NonExistent:package:feature',
          'controller:NonExistent:package',
          'controller:NonExistent',
        ])
      ).toBeUndefined();
    });

    it('should overwrite existing values', () => {
      cache.set('component:Facet', 100);
      expect(cache.get('component:Facet')).toBe(100);

      cache.set('component:Facet', 200);
      expect(cache.get('component:Facet')).toBe(200);
    });
  });

  describe('has()', () => {
    it('should return true for existing single key', () => {
      cache.set('action:fetchResults', 111);
      expect(cache.has('action:fetchResults')).toBe(true);
    });

    it('should return false for non-existent single key', () => {
      expect(cache.has('action:nonexistent')).toBe(false);
    });

    it('should return true if any key in array exists', () => {
      cache.set('reducer:search', 222);

      expect(
        cache.has([
          'reducer:search:feature',
          'reducer:search',
          'reducer:searchReducer',
        ])
      ).toBe(true);
    });

    it('should return false if none of the keys in array exist', () => {
      expect(
        cache.has(['reducer:nonexistent:feature', 'reducer:nonexistent'])
      ).toBe(false);
    });
  });

  describe('delete()', () => {
    it('should delete existing key', () => {
      cache.set('test:key', 333);
      expect(cache.has('test:key')).toBe(true);

      cache.delete('test:key');
      expect(cache.has('test:key')).toBe(false);
    });

    it('should not throw when deleting non-existent key', () => {
      expect(() => cache.delete('nonexistent')).not.toThrow();
    });
  });

  describe('clear()', () => {
    it('should remove all entries', () => {
      cache.set('key1', 1);
      cache.set('key2', 2);
      cache.set('key3', 3);

      expect(cache.size).toBe(3);

      cache.clear();
      expect(cache.size).toBe(0);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return 0 for empty cache', () => {
      expect(cache.size).toBe(0);
    });

    it('should return correct count of unique keys', () => {
      cache.set('key1', 1);
      expect(cache.size).toBe(1);

      cache.set('key2', 2);
      expect(cache.size).toBe(2);

      cache.set('key3', 3);
      expect(cache.size).toBe(3);
    });

    it('should count multiple keys for same value separately', () => {
      cache.set(['key1', 'key2', 'key3'], 100);
      expect(cache.size).toBe(3);
    });
  });
});
