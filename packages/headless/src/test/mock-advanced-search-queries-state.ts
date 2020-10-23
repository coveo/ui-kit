import {AdvancedSearchQueriesState} from '../features/advanced-search-queries/advanced-search-queries-state';

export function buildMockAdvancedSearchQueriesState(
  config: Partial<AdvancedSearchQueriesState> = {}
): AdvancedSearchQueriesState {
  return {
    aq: '',
    cq: '',
    ...config,
  };
}
