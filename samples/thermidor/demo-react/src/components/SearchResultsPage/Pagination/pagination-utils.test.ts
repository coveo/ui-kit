import {describe, it, expect} from 'vitest';
import {computeVisiblePages} from './pagination-utils.js';

describe('computeVisiblePages', () => {
  describe('when totalPages ≤ 5', () => {
    it('returns all pages for totalPages = 1', () => {
      expect(computeVisiblePages(0, 1)).toEqual([0]);
    });

    it('returns all pages for totalPages = 3', () => {
      expect(computeVisiblePages(1, 3)).toEqual([0, 1, 2]);
    });

    it('returns all pages for totalPages = 5', () => {
      expect(computeVisiblePages(2, 5)).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe('when currentPage is at the start (0 or 1)', () => {
    it('returns [0, 1, 2, ellipsis-end, last] when currentPage is 0', () => {
      expect(computeVisiblePages(0, 10)).toEqual([0, 1, 2, 'ellipsis-end', 9]);
    });

    it('returns [0, 1, 2, ellipsis-end, last] when currentPage is 1', () => {
      expect(computeVisiblePages(1, 10)).toEqual([0, 1, 2, 'ellipsis-end', 9]);
    });
  });

  describe('when currentPage is at the end', () => {
    it('returns [0, ellipsis-start, last-2, last-1, last] when currentPage is totalPages - 2', () => {
      expect(computeVisiblePages(8, 10)).toEqual([0, 'ellipsis-start', 7, 8, 9]);
    });

    it('returns [0, ellipsis-start, last-2, last-1, last] when currentPage is totalPages - 1', () => {
      expect(computeVisiblePages(9, 10)).toEqual([0, 'ellipsis-start', 7, 8, 9]);
    });
  });

  describe('when currentPage is in the middle', () => {
    it('returns [0, ellipsis-start, current, ellipsis-end, last]', () => {
      expect(computeVisiblePages(5, 10)).toEqual([0, 'ellipsis-start', 5, 'ellipsis-end', 9]);
    });

    it('returns correct window for page 3 of 8', () => {
      expect(computeVisiblePages(3, 8)).toEqual([0, 'ellipsis-start', 3, 'ellipsis-end', 7]);
    });
  });

  describe('always includes first and last page', () => {
    it('includes page 0 and last page when at start', () => {
      const result = computeVisiblePages(0, 20);
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(19);
    });

    it('includes page 0 and last page when in middle', () => {
      const result = computeVisiblePages(10, 20);
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(19);
    });

    it('includes page 0 and last page when at end', () => {
      const result = computeVisiblePages(19, 20);
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(19);
    });
  });

  describe('returns at most 5 items for large page counts', () => {
    it('returns exactly 5 items when totalPages is 100 and currentPage is 0', () => {
      expect(computeVisiblePages(0, 100)).toHaveLength(5);
    });

    it('returns exactly 5 items when totalPages is 100 and currentPage is 50', () => {
      expect(computeVisiblePages(50, 100)).toHaveLength(5);
    });

    it('returns exactly 5 items when totalPages is 100 and currentPage is 99', () => {
      expect(computeVisiblePages(99, 100)).toHaveLength(5);
    });
  });
});
