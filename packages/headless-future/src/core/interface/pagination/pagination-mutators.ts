import {paginationSlice} from '@/src/core/internal/pagination/pagination-slice.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';

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
