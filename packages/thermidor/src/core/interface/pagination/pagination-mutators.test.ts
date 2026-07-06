/**
 * Pagination Mutations Tests
 */
import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine, createTestInterface} from '@/src/test/test-utils.js';
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
import type {SearchInterface} from '@/src/public/interfaces/search.js';

describe('paginationMutations', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreatePaginationSlice(iface));
  });

  describe('setFirstResult()', () => {
    it('should return StateMutation object', () => {
      const mutation = setFirstResult(20, iface);
      expect(mutation).toEqual({
        type: 'default/pagination/setFirstResult',
        payload: 20,
      });
    });
    it('should update state when used with mutate()', () => {
      engine.mutate(setFirstResult(20, iface));
      expect(engine.read(getFirstResult(iface))).toBe(20);
    });
  });

  describe('setPageSize()', () => {
    it('should return StateMutation object', () => {
      const mutation = setPageSize(25, iface);
      expect(mutation).toEqual({
        type: 'default/pagination/setPageSize',
        payload: 25,
      });
    });
    it('should update state when used with mutate()', () => {
      engine.mutate(setPageSize(25, iface));
      expect(engine.read(getPageSize(iface))).toBe(25);
    });
  });

  describe('setTotalCount()', () => {
    it('should return StateMutation object', () => {
      const mutation = setTotalCount(100, iface);
      expect(mutation).toEqual({
        type: 'default/pagination/setTotalCount',
        payload: 100,
      });
    });
    it('should update state when used with mutate()', () => {
      engine.mutate(setTotalCount(100, iface));
      expect(engine.read(getTotalCount(iface))).toBe(100);
    });
  });

  describe('Integration: pagination flow', () => {
    it('should handle sequential mutations', () => {
      engine.mutate(setFirstResult(10, iface));
      engine.mutate(setPageSize(20, iface));
      engine.mutate(setTotalCount(200, iface));
      expect(engine.read(getFirstResult(iface))).toBe(10);
      expect(engine.read(getPageSize(iface))).toBe(20);
      expect(engine.read(getTotalCount(iface))).toBe(200);
    });
  });
});
