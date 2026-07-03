/**
 * Pagination Selectors Tests
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

describe('paginationSelectors', () => {
  let engine: FullEngine;
  let iface: SearchInterface;

  beforeEach(() => {
    const rawEngine = createTestEngine();
    engine = getFullEngine(rawEngine);
    iface = createTestInterface(rawEngine, 'default');
    engine.adoptSlice(getOrCreatePaginationSlice(iface));
  });

  describe('getFirstResult', () => {
    it('should return 0 initially', () => {
      expect(engine.read(getFirstResult(iface))).toBe(0);
    });
    it('should return updated value after mutation', () => {
      engine.mutate(setFirstResult(20, iface));
      expect(engine.read(getFirstResult(iface))).toBe(20);
    });
  });

  describe('getPageSize', () => {
    it('should return 10 initially', () => {
      expect(engine.read(getPageSize(iface))).toBe(10);
    });
    it('should return updated page size after mutation', () => {
      engine.mutate(setPageSize(25, iface));
      expect(engine.read(getPageSize(iface))).toBe(25);
    });
  });

  describe('getTotalCount', () => {
    it('should return 0 initially', () => {
      expect(engine.read(getTotalCount(iface))).toBe(0);
    });
    it('should return updated total count after mutation', () => {
      engine.mutate(setTotalCount(100, iface));
      expect(engine.read(getTotalCount(iface))).toBe(100);
    });
  });
});
