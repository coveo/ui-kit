import {PaginationState} from '../features/pagination/pagination-state';

export function buildMockPagination(
  config: Partial<PaginationState> = {}
): PaginationState {
  return {
    firstResult: 0,
    numberOfResults: 0,
    totalCountFiltered: 0,
    ...config,
  };
}
