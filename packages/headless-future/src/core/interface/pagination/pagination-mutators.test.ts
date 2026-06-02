/**
 * Pagination Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  nextPage,
  previousPage,
  resetToFirstPage,
  setPage,
  setPageSize,
  setTotalCount,
} from './pagination-mutators.js';
import {
  getCurrentPage,
  getPageSize,
  getTotalCount,
  getTotalPages,
} from './pagination-selectors.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {paginationSlice} from '@/src/core/internal/pagination/pagination-slice.js';

describe('paginationMutations', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(paginationSlice);
  });

  describe('setPage()', () => {
    it('should return StateMutation object', () => {
      const mutation = setPage(3);

      expect(mutation).toEqual({
        type: 'pagination/setPage',
        payload: 3,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(setPage(5));
      expect(engine.read(getCurrentPage)).toBe(5);
    });
  });

  describe('setPageSize()', () => {
    it('should return StateMutation object', () => {
      const mutation = setPageSize(25);

      expect(mutation).toEqual({
        type: 'pagination/setPageSize',
        payload: 25,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(setPageSize(20));
      expect(engine.read(getPageSize)).toBe(20);
    });

    it('should reset to page 1 when changed', () => {
      engine.mutate(setPage(5));
      engine.mutate(setPageSize(20));

      expect(engine.read(getCurrentPage)).toBe(1);
      expect(engine.read(getPageSize)).toBe(20);
    });
  });

  describe('setTotalCount()', () => {
    it('should return StateMutation object', () => {
      const mutation = setTotalCount(100);

      expect(mutation).toEqual({
        type: 'pagination/setTotalCount',
        payload: 100,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(setTotalCount(150));
      expect(engine.read(getTotalCount)).toBe(150);
    });
  });

  describe('nextPage()', () => {
    it('should return StateMutation object without payload', () => {
      const mutation = nextPage();

      expect(mutation).toEqual({
        type: 'pagination/nextPage',
      });
    });

    it('should increment page when used with mutate()', () => {
      engine.mutate(setTotalCount(100));
      engine.mutate(nextPage());

      expect(engine.read(getCurrentPage)).toBe(2);
    });

    it('should not exceed total pages', () => {
      engine.mutate(setTotalCount(100));
      engine.mutate(setPage(10));
      engine.mutate(nextPage());

      expect(engine.read(getCurrentPage)).toBe(10);
    });
  });

  describe('previousPage()', () => {
    it('should return StateMutation object without payload', () => {
      const mutation = previousPage();

      expect(mutation).toEqual({
        type: 'pagination/previousPage',
      });
    });

    it('should decrement page when used with mutate()', () => {
      engine.mutate(setPage(3));
      engine.mutate(previousPage());

      expect(engine.read(getCurrentPage)).toBe(2);
    });

    it('should not go below page 1', () => {
      engine.mutate(previousPage());
      expect(engine.read(getCurrentPage)).toBe(1);
    });
  });

  describe('resetToFirstPage()', () => {
    it('should return StateMutation object without payload', () => {
      const mutation = resetToFirstPage();

      expect(mutation).toEqual({
        type: 'pagination/resetToFirstPage',
      });
    });

    it('should reset to page 1 when used with mutate()', () => {
      engine.mutate(setPage(8));
      engine.mutate(resetToFirstPage());

      expect(engine.read(getCurrentPage)).toBe(1);
    });
  });

  describe('Integration: navigation flow', () => {
    beforeEach(() => {
      engine.mutate(setTotalCount(100));
      engine.mutate(setPageSize(10));
    });

    it('should handle sequential page navigation', () => {
      // Start at page 1
      expect(engine.read(getCurrentPage)).toBe(1);

      // Navigate forward
      engine.mutate(nextPage());
      expect(engine.read(getCurrentPage)).toBe(2);

      engine.mutate(nextPage());
      expect(engine.read(getCurrentPage)).toBe(3);

      // Navigate backward
      engine.mutate(previousPage());
      expect(engine.read(getCurrentPage)).toBe(2);

      // Jump to specific page
      engine.mutate(setPage(7));
      expect(engine.read(getCurrentPage)).toBe(7);

      // Reset
      engine.mutate(resetToFirstPage());
      expect(engine.read(getCurrentPage)).toBe(1);
    });

    it('should respect boundaries', () => {
      // Try to go back from first page
      engine.mutate(previousPage());
      expect(engine.read(getCurrentPage)).toBe(1);

      // Go to last page
      engine.mutate(setPage(10));
      expect(engine.read(getCurrentPage)).toBe(10);

      // Try to go beyond last page
      engine.mutate(nextPage());
      expect(engine.read(getCurrentPage)).toBe(10);
    });

    it('should handle page size change correctly', () => {
      engine.mutate(setPage(5));
      expect(engine.read(getCurrentPage)).toBe(5);

      // Changing page size should reset to page 1
      engine.mutate(setPageSize(25));
      expect(engine.read(getCurrentPage)).toBe(1);
      expect(engine.read(getPageSize)).toBe(25);
      expect(engine.read(getTotalPages)).toBe(4); // 100 / 25 = 4
    });
  });
});
