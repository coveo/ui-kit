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
import {Engine} from '@/src/core/interface/engine/engine.js';

/**
 * Pagination mutations
 */

export const setPage = (engine: Engine, page: number) => {
  engine.mutate(paginationSlice.actions.setPage(page));
};

export const setPageSize = (engine: Engine, pageSize: number) => {
  engine.mutate(paginationSlice.actions.setPageSize(pageSize));
};

export const setTotalCount = (engine: Engine, totalCount: number) => {
  engine.mutate(paginationSlice.actions.setTotalCount(totalCount));
};

export const nextPage = (engine: Engine) => {
  engine.mutate(paginationSlice.actions.nextPage());
};

export const previousPage = (engine: Engine) => {
  engine.mutate(paginationSlice.actions.previousPage());
};

export const resetToFirstPage = (engine: Engine) => {
  engine.mutate(paginationSlice.actions.resetToFirstPage());
};
