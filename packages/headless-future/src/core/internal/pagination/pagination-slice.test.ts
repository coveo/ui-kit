/**
 * Pagination Slice Tests
 */

import {describe, it, expect} from 'vitest';
import {paginationSlice, initialPaginationState} from './pagination-slice.js';
import * as PaginationActions from './pagination-actions.js';

describe('paginationSlice: initialState', () => {
  it('should have correct initial state', () => {
    expect(initialPaginationState).toEqual({
      currentPage: 1,
      pageSize: 10,
      totalCount: 0,
    });
  });
});

describe('paginationSlice: setPage', () => {
  it('should update current page', () => {
    const state = paginationSlice.reducer(
      initialPaginationState,
      PaginationActions.setPage(3)
    );

    expect(state.currentPage).toBe(3);
  });

  it('should not affect other fields', () => {
    const state = paginationSlice.reducer(
      {...initialPaginationState, pageSize: 20, totalCount: 100},
      PaginationActions.setPage(5)
    );

    expect(state.currentPage).toBe(5);
    expect(state.pageSize).toBe(20);
    expect(state.totalCount).toBe(100);
  });

  it('should maintain state immutability', () => {
    const original = {...initialPaginationState};
    paginationSlice.reducer(original, PaginationActions.setPage(2));

    expect(original.currentPage).toBe(1);
  });
});

describe('paginationSlice: setPageSize', () => {
  it('should update page size', () => {
    const state = paginationSlice.reducer(
      initialPaginationState,
      PaginationActions.setPageSize(25)
    );

    expect(state.pageSize).toBe(25);
  });

  it('should reset to first page when page size changes', () => {
    const currentState = {
      currentPage: 5,
      pageSize: 10,
      totalCount: 100,
    };

    const state = paginationSlice.reducer(
      currentState,
      PaginationActions.setPageSize(20)
    );

    expect(state.pageSize).toBe(20);
    expect(state.currentPage).toBe(1);
  });

  it('should not affect total count', () => {
    const state = paginationSlice.reducer(
      {...initialPaginationState, totalCount: 150},
      PaginationActions.setPageSize(50)
    );

    expect(state.totalCount).toBe(150);
  });
});

describe('paginationSlice: setTotalCount', () => {
  it('should update total count', () => {
    const state = paginationSlice.reducer(
      initialPaginationState,
      PaginationActions.setTotalCount(100)
    );

    expect(state.totalCount).toBe(100);
  });

  it('should not affect other fields', () => {
    const state = paginationSlice.reducer(
      {currentPage: 3, pageSize: 20, totalCount: 0},
      PaginationActions.setTotalCount(200)
    );

    expect(state.totalCount).toBe(200);
    expect(state.currentPage).toBe(3);
    expect(state.pageSize).toBe(20);
  });
});

describe('paginationSlice: nextPage', () => {
  it('should increment current page when not on last page', () => {
    const state = paginationSlice.reducer(
      {currentPage: 2, pageSize: 10, totalCount: 100},
      PaginationActions.nextPage()
    );

    expect(state.currentPage).toBe(3);
  });

  it('should not exceed total pages', () => {
    // 100 total, 10 per page = 10 pages
    const state = paginationSlice.reducer(
      {currentPage: 10, pageSize: 10, totalCount: 100},
      PaginationActions.nextPage()
    );

    expect(state.currentPage).toBe(10); // Should stay on page 10
  });

  it('should handle edge case with 0 total count', () => {
    const state = paginationSlice.reducer(
      {currentPage: 1, pageSize: 10, totalCount: 0},
      PaginationActions.nextPage()
    );

    expect(state.currentPage).toBe(1); // Can't go beyond page 1
  });

  it('should calculate total pages correctly', () => {
    // 95 total, 10 per page = 10 pages (ceiling)
    const state = paginationSlice.reducer(
      {currentPage: 9, pageSize: 10, totalCount: 95},
      PaginationActions.nextPage()
    );

    expect(state.currentPage).toBe(10);
  });
});

describe('paginationSlice: previousPage', () => {
  it('should decrement current page when not on first page', () => {
    const state = paginationSlice.reducer(
      {currentPage: 3, pageSize: 10, totalCount: 100},
      PaginationActions.previousPage()
    );

    expect(state.currentPage).toBe(2);
  });

  it('should not go below page 1', () => {
    const state = paginationSlice.reducer(
      {currentPage: 1, pageSize: 10, totalCount: 100},
      PaginationActions.previousPage()
    );

    expect(state.currentPage).toBe(1);
  });

  it('should work when on page 2', () => {
    const state = paginationSlice.reducer(
      {currentPage: 2, pageSize: 10, totalCount: 100},
      PaginationActions.previousPage()
    );

    expect(state.currentPage).toBe(1);
  });
});

describe('paginationSlice: resetToFirstPage', () => {
  it('should reset to page 1', () => {
    const state = paginationSlice.reducer(
      {currentPage: 5, pageSize: 10, totalCount: 100},
      PaginationActions.resetToFirstPage()
    );

    expect(state.currentPage).toBe(1);
  });

  it('should not affect other fields', () => {
    const state = paginationSlice.reducer(
      {currentPage: 10, pageSize: 25, totalCount: 200},
      PaginationActions.resetToFirstPage()
    );

    expect(state.currentPage).toBe(1);
    expect(state.pageSize).toBe(25);
    expect(state.totalCount).toBe(200);
  });

  it('should work when already on first page', () => {
    const state = paginationSlice.reducer(
      initialPaginationState,
      PaginationActions.resetToFirstPage()
    );

    expect(state.currentPage).toBe(1);
  });
});

describe('paginationSlice: pagination flow', () => {
  it('should handle sequential navigation', () => {
    let state = {currentPage: 1, pageSize: 10, totalCount: 100};

    // Go to page 5
    state = paginationSlice.reducer(state, PaginationActions.setPage(5));
    expect(state.currentPage).toBe(5);

    // Next page
    state = paginationSlice.reducer(state, PaginationActions.nextPage());
    expect(state.currentPage).toBe(6);

    // Previous page
    state = paginationSlice.reducer(state, PaginationActions.previousPage());
    expect(state.currentPage).toBe(5);

    // Reset
    state = paginationSlice.reducer(
      state,
      PaginationActions.resetToFirstPage()
    );
    expect(state.currentPage).toBe(1);
  });

  it('should handle page size change flow', () => {
    let state = {currentPage: 5, pageSize: 10, totalCount: 100};

    // Change page size (should reset to page 1)
    state = paginationSlice.reducer(state, PaginationActions.setPageSize(25));
    expect(state.currentPage).toBe(1);
    expect(state.pageSize).toBe(25);

    // Go to page 2
    state = paginationSlice.reducer(state, PaginationActions.setPage(2));
    expect(state.currentPage).toBe(2);
  });
});

describe('paginationSlice: state immutability', () => {
  it('should not mutate original state for any action', () => {
    const original = {...initialPaginationState};

    paginationSlice.reducer(original, PaginationActions.setPage(5));
    expect(original.currentPage).toBe(1);

    paginationSlice.reducer(original, PaginationActions.setPageSize(20));
    expect(original.pageSize).toBe(10);

    paginationSlice.reducer(original, PaginationActions.nextPage());
    expect(original.currentPage).toBe(1);
  });
});
