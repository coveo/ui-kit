/**
 * Pagination Selectors Tests
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

describe('paginationSelectors', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(getOrCreatePaginationSlice('default'));
  });

  describe('getFirstResult', () => {
    it('should return 0 initially', () => {
      expect(engine.read(getFirstResult)).toBe(0);
    });

    it('should return updated value after mutation', () => {
      engine.mutate(setFirstResult(20));
      expect(engine.read(getFirstResult)).toBe(20);
    });
  });

  describe('getPageSize', () => {
    it('should return 10 initially', () => {
      expect(engine.read(getPageSize)).toBe(10);
    });

    it('should return updated page size after mutation', () => {
      engine.mutate(setPageSize(25));
      expect(engine.read(getPageSize)).toBe(25);
    });
  });

  describe('getTotalCount', () => {
    it('should return 0 initially', () => {
      expect(engine.read(getTotalCount)).toBe(0);
    });

    it('should return updated total count after mutation', () => {
      engine.mutate(setTotalCount(100));
      expect(engine.read(getTotalCount)).toBe(100);
    });
  });
});
