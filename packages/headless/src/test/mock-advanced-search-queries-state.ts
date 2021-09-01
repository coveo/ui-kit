import {AdvancedSearchQueriesState} from '../features/advanced-search-queries/advanced-search-queries-state';

export function buildMockAdvancedSearchQueriesState(
  config: Partial<AdvancedSearchQueriesState> = {}
): AdvancedSearchQueriesState {
  return {
    cq: '',
    cqWasSet: false,
    aq: '',
    aqWasSet: false,
    lq: '',
    lqWasSet: false,
    defaultFilters: {aq: '', cq: '', lq: ''},
    ...config,
  };
}
