import type {PaginationState} from '../features/pagination/pagination-state.js';

export function buildMockPagination(
  config: Partial<PaginationState> = {}
): PaginationState {
  return {
    firstResult: 0,
    defaultNumberOfResults: 0,
    numberOfResults: 0,
    totalCountFiltered: 0,
    ...config,
  };
}
