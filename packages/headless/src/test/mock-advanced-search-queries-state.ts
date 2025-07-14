import type {AdvancedSearchQueriesState} from '../features/advanced-search-queries/advanced-search-queries-state.js';

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
    dq: '',
    dqWasSet: false,
    defaultFilters: {aq: '', cq: '', lq: '', dq: ''},
    ...config,
  };
}
