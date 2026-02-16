import {describe, expect, it} from 'vitest';
import {parseDependsOn} from './depends-on';

describe('depends-on', () => {
  describe('#parseDependsOn', () => {
    it('should return empty array when no dependencies are provided', () => {
      const conditions = parseDependsOn({});
      expect(conditions).toEqual([]);
    });

    it('should throw when depending on multiple facets', () => {
      expect(() => parseDependsOn({a: 'x', b: 'y'})).toThrow(
        "Depending on multiple facets isn't supported"
      );
    });

    it('should create condition with correct parentFacetId', () => {
      const conditions = parseDependsOn({facet1: 'value1'});
      expect(conditions).toHaveLength(1);
      expect(conditions[0].parentFacetId).toBe('facet1');
    });

    it('should return true for selected simple facet matching expected value', () => {
      const [cond] = parseDependsOn({facet: 'val'});
      expect(cond.condition([{value: 'val', state: 'selected'}])).toBe(true);
    });

    it('should return false for selected simple facet with non-matching value', () => {
      const [cond] = parseDependsOn({facet: 'val'});
      expect(cond.condition([{value: 'other', state: 'selected'}])).toBe(false);
    });

    it('should return false for simple facet not selected', () => {
      const [cond] = parseDependsOn({facet: 'val'});
      expect(cond.condition([{value: 'val', state: 'idle'}])).toBe(false);
    });

    it('should return true for any selected simple facet when expected is empty', () => {
      const [cond] = parseDependsOn({facet: ''});
      expect(cond.condition([{value: 'any', state: 'selected'}])).toBe(true);
    });

    it('should return true for selected category facet matching expected value', () => {
      const categoryValue = {value: 'cat', state: 'selected', children: []};
      const [cond] = parseDependsOn({facet: 'cat'});
      expect(cond.condition([categoryValue])).toBe(true);
    });

    it('should return false for selected category facet with non-matching value', () => {
      const categoryValue = {value: 'cat', state: 'selected', children: []};
      const [cond] = parseDependsOn({facet: 'other'});
      expect(cond.condition([categoryValue])).toBe(false);
    });

    it('should return true when nested child in category facet is selected and matches expected', () => {
      const nested = {
        value: 'child',
        state: 'selected',
        children: [],
      };
      const parent = {value: 'parent', state: 'idle', children: [nested]};
      const [cond] = parseDependsOn({facet: 'child'});
      expect(cond.condition([parent])).toBe(true);
    });

    it('should return false when no simple or category facet is selected', () => {
      const simple = {value: 'v', state: 'idle'};
      const category = {value: 'c', state: 'idle', children: []};
      const [cond] = parseDependsOn({facet: 'v'});
      expect(cond.condition([simple, category])).toBe(false);
    });

    it('should return true for any selected category facet when expected is empty', () => {
      const nested = {
        value: 'child',
        state: 'selected',
        children: [],
      };
      const parent = {value: 'parent', state: 'idle', children: [nested]};
      const [cond] = parseDependsOn({facet: ''});
      expect(cond.condition([parent])).toBe(true);
    });
  });
});
