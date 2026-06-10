import {
  setPage as _setPage,
  setPageSize as _setPageSize,
  setTotalCount as _setTotalCount,
  nextPage as _nextPage,
  previousPage as _previousPage,
  resetToFirstPage as _resetToFirstPage,
} from '@/src/core/internal/pagination/pagination-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';

export const setPage = (page: number): StateMutation => {
  return _setPage(page);
};

export const setPageSize = (pageSize: number): StateMutation => {
  return _setPageSize(pageSize);
};

export const setTotalCount = (totalCount: number): StateMutation => {
  return _setTotalCount(totalCount);
};

export const nextPage = (): StateMutation => {
  return _nextPage();
};

export const previousPage = (): StateMutation => {
  return _previousPage();
};

export const resetToFirstPage = (): StateMutation => {
  return _resetToFirstPage();
};
