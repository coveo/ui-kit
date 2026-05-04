/**
 * Pagination Feature Mutations
 *
 * Provides library-agnostic mutation API for pagination state changes.
 * CRITICAL: NO Redux or Immer types exposed.
 *
 * NOTE: Mutations are dispatched without slice adoption.
 * If the pagination slice is not loaded, mutations will have no effect.
 */

import {paginationSlice} from '@/src/core/internal/pagination/pagination-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';

/**
 * Pagination mutations
 */

export const setPage = (page: number): StateMutation => {
  return paginationSlice.actions.setPage(page);
};

export const setPageSize = (pageSize: number): StateMutation => {
  return paginationSlice.actions.setPageSize(pageSize);
};

export const setTotalCount = (totalCount: number): StateMutation => {
  return paginationSlice.actions.setTotalCount(totalCount);
};

export const nextPage = (): StateMutation => {
  return paginationSlice.actions.nextPage();
};

export const previousPage = (): StateMutation => {
  return paginationSlice.actions.previousPage();
};

export const resetToFirstPage = (): StateMutation => {
  return paginationSlice.actions.resetToFirstPage();
};
