/**
 * Pagination Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  setFirstResult,
  setPageSize,
  setTotalCount,
} from './pagination-mutators.js';
import {
  getFirstResult,
  getPageSize,
  getTotalCount,
} from './pagination-selectors.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreatePaginationSlice} from '@/src/core/internal/pagination/pagination-slice.js';

describe('paginationMutations', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(getOrCreatePaginationSlice('default'));
  });

  describe('setFirstResult()', () => {
    it('should return StateMutation object', () => {
      const mutation = setFirstResult(20);

      expect(mutation).toEqual({
        type: 'default/pagination/setFirstResult',
        payload: 20,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(setFirstResult(30));
      expect(engine.read(getFirstResult)).toBe(30);
    });
  });

  describe('setPageSize()', () => {
    it('should return StateMutation object', () => {
      const mutation = setPageSize(25);

      expect(mutation).toEqual({
        type: 'default/pagination/setPageSize',
        payload: 25,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(setPageSize(20));
      expect(engine.read(getPageSize)).toBe(20);
    });
  });

  describe('setTotalCount()', () => {
    it('should return StateMutation object', () => {
      const mutation = setTotalCount(100);

      expect(mutation).toEqual({
        type: 'default/pagination/setTotalCount',
        payload: 100,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(setTotalCount(150));
      expect(engine.read(getTotalCount)).toBe(150);
    });
  });

  describe('Integration: pagination flow', () => {
    it('should handle sequential mutations', () => {
      engine.mutate(setFirstResult(0));
      engine.mutate(setPageSize(10));
      engine.mutate(setTotalCount(100));

      expect(engine.read(getFirstResult)).toBe(0);
      expect(engine.read(getPageSize)).toBe(10);
      expect(engine.read(getTotalCount)).toBe(100);

      engine.mutate(setFirstResult(10));
      expect(engine.read(getFirstResult)).toBe(10);

      engine.mutate(setPageSize(25));
      expect(engine.read(getPageSize)).toBe(25);
    });
  });
});
