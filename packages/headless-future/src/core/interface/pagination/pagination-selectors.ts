import {State} from '@/src/core/interface/engine/engine-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {
  initialPaginationState,
  type PaginationState,
} from '@/src/core/internal/pagination/pagination-slice.js';

const getPaginationState = (state: State) =>
  ((state as Record<string, unknown>)[
    'default/pagination'
  ] as PaginationState) ?? initialPaginationState;

export const getFirstResult = createMemoizedStateSelector(
  getPaginationState,
  (pagination) => pagination.firstResult
);

export const getPageSize = createMemoizedStateSelector(
  getPaginationState,
  (pagination) => pagination.pageSize
);

export const getTotalCount = createMemoizedStateSelector(
  getPaginationState,
  (pagination) => pagination.totalCount
);
