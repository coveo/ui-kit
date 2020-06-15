import {PaginationState} from '../features/pagination/pagination-slice';

export function buildMockPagination(
  config: Partial<PaginationState> = {}
): PaginationState {
  return {
    firstResult: 0,
    numberOfResults: 0,
    ...config,
  };
}
