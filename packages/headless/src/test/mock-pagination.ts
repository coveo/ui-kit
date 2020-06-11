import {PaginationState} from '../features/pagination/pagination-slice';

export function buildMockPagination(
  config: Partial<PaginationState> = {}
): PaginationState {
  return {
    numberOfResults: 0,
    ...config,
  };
}
