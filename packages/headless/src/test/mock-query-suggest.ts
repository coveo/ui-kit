import type {QuerySuggestState} from '../features/query-suggest/query-suggest-state.js';

export function buildMockQuerySuggest(
  config: Partial<QuerySuggestState> = {}
): QuerySuggestState {
  return {
    id: '',
    count: 0,
    currentRequestId: '',
    completions: [],
    responseId: '',
    error: null,
    partialQueries: [],
    isLoading: false,
    ...config,
  };
}
