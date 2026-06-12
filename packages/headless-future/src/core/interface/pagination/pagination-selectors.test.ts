/**
 * Pagination Selectors Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {setPage, setPageSize, setTotalCount} from './pagination-mutators.js';
import {
  getCurrentPage,
  getIsFirstPage,
  getIsLastPage,
  getPageSize,
  getTotalCount,
  getTotalPages,
} from './pagination-selectors.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {paginationSlice} from '@/src/core/internal/pagination/pagination-slice.js';

describe('createPaginationSelectors()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(paginationSlice); // Ensure slice is loaded
  });

  describe('currentPage selector', () => {
    it('should return 1 initially', () => {
      const currentPage = engine.read(getCurrentPage);
      expect(currentPage).toBe(1);
    });

    it('should return updated page after mutation', () => {
      engine.mutate(setPage(5));
      const currentPage = engine.read(getCurrentPage);
      expect(currentPage).toBe(5);
    });
  });

  describe('pageSize selector', () => {
    it('should return 10 initially', () => {
      const pageSize = engine.read(getPageSize);
      expect(pageSize).toBe(10);
    });

    it('should return updated page size after mutation', () => {
      engine.mutate(setPageSize(25));
      const pageSize = engine.read(getPageSize);
      expect(pageSize).toBe(25);
    });
  });

  describe('totalCount selector', () => {
    it('should return 0 initially', () => {
      const totalCount = engine.read(getTotalCount);
      expect(totalCount).toBe(0);
    });

    it('should return updated total count after mutation', () => {
      engine.mutate(setTotalCount(100));
      const totalCount = engine.read(getTotalCount);
      expect(totalCount).toBe(100);
    });
  });

  describe('totalPages selector', () => {
    it('should return 0 initially (0 items, 10 per page)', () => {
      const totalPages = engine.read(getTotalPages);
      expect(totalPages).toBe(0);
    });

    it('should calculate total pages correctly', () => {
      engine.mutate(setTotalCount(100));
      const totalPages = engine.read(getTotalPages);
      expect(totalPages).toBe(10); // 100 / 10 = 10 pages
    });

    it('should handle non-exact page divisions (ceiling)', () => {
      engine.mutate(setTotalCount(95));
      const totalPages = engine.read(getTotalPages);
      expect(totalPages).toBe(10); // ceil(95 / 10) = 10 pages
    });

    it('should update when page size changes', () => {
      engine.mutate(setTotalCount(100));
      engine.mutate(setPageSize(20));
      const totalPages = engine.read(getTotalPages);
      expect(totalPages).toBe(5); // 100 / 20 = 5 pages
    });

    it('should return 1 when totalCount is 1', () => {
      engine.mutate(setTotalCount(1));
      const totalPages = engine.read(getTotalPages);
      expect(totalPages).toBe(1);
    });
  });

  describe('totalPages selector', () => {
    it('should return 0 initially', () => {
      const totalPages = engine.read(getTotalPages);
      expect(totalPages).toBe(0);
    });

    it('should calculate total pages correctly', () => {
      engine.mutate(setTotalCount(100));
      const totalPages = engine.read(getTotalPages);
      expect(totalPages).toBe(10);
    });

    it('should handle non-exact divisions', () => {
      engine.mutate(setTotalCount(95));
      const totalPages = engine.read(getTotalPages);
      expect(totalPages).toBe(10);
    });

    it('should update when page size changes', () => {
      engine.mutate(setTotalCount(100));
      engine.mutate(setPageSize(25));
      const totalPages = engine.read(getTotalPages);
      expect(totalPages).toBe(4);
    });

    it('should memoize results with same inputs', () => {
      engine.mutate(setTotalCount(50));
      const result1 = engine.read(getTotalPages);
      const result2 = engine.read(getTotalPages);
      expect(result1).toBe(result2);
    });
  });

  describe('isFirstPage selector', () => {
    it('should return true when on first page', () => {
      engine.mutate(setPage(1));
      const isFirstPage = engine.read(getIsFirstPage);
      expect(isFirstPage).toBe(true);
    });

    it('should return false when not on first page', () => {
      engine.mutate(setPage(2));
      const isFirstPage = engine.read(getIsFirstPage);
      expect(isFirstPage).toBe(false);
    });
  });

  describe('isLastPage selector', () => {
    it('should return true when on last page', () => {
      engine.mutate(setTotalCount(100));
      engine.mutate(setPageSize(10));
      engine.mutate(setPage(10));
      const isLastPage = engine.read(getIsLastPage);
      expect(isLastPage).toBe(true);
    });

    it('should return false when not on last page', () => {
      engine.mutate(setTotalCount(100));
      engine.mutate(setPageSize(10));
      engine.mutate(setPage(5));
      const isLastPage = engine.read(getIsLastPage);
      expect(isLastPage).toBe(false);
    });
  });
});
