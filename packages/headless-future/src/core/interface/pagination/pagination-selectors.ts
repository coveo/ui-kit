import {State} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {initialPaginationState} from '@/src/core/internal/pagination/pagination-slice.js';

const getPaginationState = (state: State) =>
  state.pagination ?? initialPaginationState;

export const getCurrentPage = createMemoizedStateSelector(
  getPaginationState,
  (pagination) => pagination.currentPage
);

export const getPageSize = createMemoizedStateSelector(
  getPaginationState,
  (pagination) => pagination.pageSize
);

export const getFirstResult = createMemoizedStateSelector(
  getCurrentPage,
  getPageSize,
  (currentPage, pageSize) => (currentPage - 1) * pageSize
);

export const getTotalCount = createMemoizedStateSelector(
  getPaginationState,
  (pagination) => pagination.totalCount
);

export const getTotalPages = createMemoizedStateSelector(
  getPaginationState,
  (pagination) => {
    return Math.ceil(pagination.totalCount / pagination.pageSize);
  }
);

export const getIsFirstPage = createMemoizedStateSelector(
  getPaginationState,
  (pagination) => pagination.currentPage === 1
);

export const getIsLastPage = createMemoizedStateSelector(
  getPaginationState,
  getTotalPages,
  (pagination, total) => pagination.currentPage === total
);
