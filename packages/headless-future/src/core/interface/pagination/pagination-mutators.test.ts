/**
 * Pagination Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import * as mutations from './pagination-mutators.js';
import * as selectors from './pagination-selectors.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {paginationSlice} from '@/src/core/internal/pagination/pagination-slice.js';

describe('paginationMutations', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
    engine.adoptSlice(paginationSlice);
  });

  describe('setPage()', () => {
    it('should return StateMutation object', () => {
      const mutation = mutations.setPage(3);

      expect(mutation).toEqual({
        type: 'pagination/setPage',
        payload: 3,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(mutations.setPage(5));
      expect(engine.read(selectors.currentPage)).toBe(5);
    });
  });

  describe('setPageSize()', () => {
    it('should return StateMutation object', () => {
      const mutation = mutations.setPageSize(25);

      expect(mutation).toEqual({
        type: 'pagination/setPageSize',
        payload: 25,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(mutations.setPageSize(20));
      expect(engine.read(selectors.pageSize)).toBe(20);
    });

    it('should reset to page 1 when changed', () => {
      engine.mutate(mutations.setPage(5));
      engine.mutate(mutations.setPageSize(20));

      expect(engine.read(selectors.currentPage)).toBe(1);
      expect(engine.read(selectors.pageSize)).toBe(20);
    });
  });

  describe('setTotalCount()', () => {
    it('should return StateMutation object', () => {
      const mutation = mutations.setTotalCount(100);

      expect(mutation).toEqual({
        type: 'pagination/setTotalCount',
        payload: 100,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(mutations.setTotalCount(150));
      expect(engine.read(selectors.totalCount)).toBe(150);
    });
  });

  describe('nextPage()', () => {
    it('should return StateMutation object without payload', () => {
      const mutation = mutations.nextPage();

      expect(mutation).toEqual({
        type: 'pagination/nextPage',
      });
    });

    it('should increment page when used with mutate()', () => {
      engine.mutate(mutations.setTotalCount(100));
      engine.mutate(mutations.nextPage());

      expect(engine.read(selectors.currentPage)).toBe(2);
    });

    it('should not exceed total pages', () => {
      engine.mutate(mutations.setTotalCount(100));
      engine.mutate(mutations.setPage(10));
      engine.mutate(mutations.nextPage());

      expect(engine.read(selectors.currentPage)).toBe(10);
    });
  });

  describe('previousPage()', () => {
    it('should return StateMutation object without payload', () => {
      const mutation = mutations.previousPage();

      expect(mutation).toEqual({
        type: 'pagination/previousPage',
      });
    });

    it('should decrement page when used with mutate()', () => {
      engine.mutate(mutations.setPage(3));
      engine.mutate(mutations.previousPage());

      expect(engine.read(selectors.currentPage)).toBe(2);
    });

    it('should not go below page 1', () => {
      engine.mutate(mutations.previousPage());
      expect(engine.read(selectors.currentPage)).toBe(1);
    });
  });

  describe('resetToFirstPage()', () => {
    it('should return StateMutation object without payload', () => {
      const mutation = mutations.resetToFirstPage();

      expect(mutation).toEqual({
        type: 'pagination/resetToFirstPage',
      });
    });

    it('should reset to page 1 when used with mutate()', () => {
      engine.mutate(mutations.setPage(8));
      engine.mutate(mutations.resetToFirstPage());

      expect(engine.read(selectors.currentPage)).toBe(1);
    });
  });

  describe('Integration: navigation flow', () => {
    beforeEach(() => {
      engine.mutate(mutations.setTotalCount(100));
      engine.mutate(mutations.setPageSize(10));
    });

    it('should handle sequential page navigation', () => {
      // Start at page 1
      expect(engine.read(selectors.currentPage)).toBe(1);

      // Navigate forward
      engine.mutate(mutations.nextPage());
      expect(engine.read(selectors.currentPage)).toBe(2);

      engine.mutate(mutations.nextPage());
      expect(engine.read(selectors.currentPage)).toBe(3);

      // Navigate backward
      engine.mutate(mutations.previousPage());
      expect(engine.read(selectors.currentPage)).toBe(2);

      // Jump to specific page
      engine.mutate(mutations.setPage(7));
      expect(engine.read(selectors.currentPage)).toBe(7);

      // Reset
      engine.mutate(mutations.resetToFirstPage());
      expect(engine.read(selectors.currentPage)).toBe(1);
    });

    it('should respect boundaries', () => {
      // Try to go back from first page
      engine.mutate(mutations.previousPage());
      expect(engine.read(selectors.currentPage)).toBe(1);

      // Go to last page
      engine.mutate(mutations.setPage(10));
      expect(engine.read(selectors.currentPage)).toBe(10);

      // Try to go beyond last page
      engine.mutate(mutations.nextPage());
      expect(engine.read(selectors.currentPage)).toBe(10);
    });

    it('should handle page size change correctly', () => {
      engine.mutate(mutations.setPage(5));
      expect(engine.read(selectors.currentPage)).toBe(5);

      // Changing page size should reset to page 1
      engine.mutate(mutations.setPageSize(25));
      expect(engine.read(selectors.currentPage)).toBe(1);
      expect(engine.read(selectors.pageSize)).toBe(25);
      expect(engine.read(selectors.totalPages)).toBe(4); // 100 / 25 = 4
    });
  });
});
