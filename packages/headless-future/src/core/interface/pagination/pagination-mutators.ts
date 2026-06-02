import * as paginationActions from '@/src/core/internal/pagination/pagination-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';

export const setPage = (page: number): StateMutation => {
  return paginationActions.setPage(page);
};

export const setPageSize = (pageSize: number): StateMutation => {
  return paginationActions.setPageSize(pageSize);
};

export const setTotalCount = (totalCount: number): StateMutation => {
  return paginationActions.setTotalCount(totalCount);
};

export const nextPage = (): StateMutation => {
  return paginationActions.nextPage();
};

export const previousPage = (): StateMutation => {
  return paginationActions.previousPage();
};

export const resetToFirstPage = (): StateMutation => {
  return paginationActions.resetToFirstPage();
};
