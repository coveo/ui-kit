/**
 * Pagination Feature Slice (Redux Implementation)
 *
 * This file contains Redux-specific implementation for the pagination feature.
 * It is INTERNAL to Layer 0 and must NEVER be exported from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {PaginationState} from '@/src/core/interface/pagination/types.js';

/**
 * Initial pagination state
 */
export const initialPaginationState: PaginationState = {
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
};

/**
 * Pagination slice manages page navigation
 */
export const paginationSlice = createSlice({
  name: 'pagination',
  initialState: initialPaginationState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      // Reset to first page when page size changes
      state.currentPage = 1;
    },
    setTotalCount: (state, action: PayloadAction<number>) => {
      state.totalCount = action.payload;
    },
    nextPage: (state) => {
      const totalPages = Math.ceil(state.totalCount / state.pageSize);
      if (state.currentPage < totalPages) {
        state.currentPage += 1;
      }
    },
    previousPage: (state) => {
      if (state.currentPage > 1) {
        state.currentPage -= 1;
      }
    },
    resetToFirstPage: (state) => {
      state.currentPage = 1;
    },
  },
  selectors: {
    currentPage: (state) => state.currentPage,
    pageSize: (state) => state.pageSize,
    totalCount: (state) => state.totalCount,
    totalPages: (state) => Math.ceil(state.totalCount / state.pageSize),
    isFirstPage: (state) => state.currentPage === 1,
    isLastPage: (state) => {
      const totalPages = Math.ceil(state.totalCount / state.pageSize);
      return state.currentPage === totalPages;
    },
  },
});
