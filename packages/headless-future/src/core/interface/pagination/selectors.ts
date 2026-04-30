/**
 * Pagination Feature Selectors
 *
 * Provides library-agnostic selectors for reading pagination state.
 * CRITICAL: NO Redux or Immer types exposed.
 */

import {paginationSlice} from '@/src/core/internal/pagination/slice.js';
import type {PaginationState} from './types.js';

type StateWithPaginationSlice = {pagination: PaginationState};

export const currentPage = (state: StateWithPaginationSlice) => {
  return paginationSlice.selectors.currentPage(state);
};
export const pageSize = (state: StateWithPaginationSlice) => {
  return paginationSlice.selectors.pageSize(state);
};
export const totalCount = (state: StateWithPaginationSlice) => {
  return paginationSlice.selectors.totalCount(state);
};
export const totalPages = (state: StateWithPaginationSlice) => {
  return paginationSlice.selectors.totalPages(state);
};
export const isFirstPage = (state: StateWithPaginationSlice) => {
  return paginationSlice.selectors.isFirstPage(state);
};
export const isLastPage = (state: StateWithPaginationSlice) => {
  return paginationSlice.selectors.isLastPage(state);
};
