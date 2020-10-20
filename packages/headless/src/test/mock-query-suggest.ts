import {QuerySuggestState} from '../features/query-suggest/query-suggest-slice';

export function buildMockQuerySuggest(
  config: Partial<QuerySuggestState> = {}
): QuerySuggestState {
  return {
    id: '',
    count: 0,
    currentRequestId: '',
    q: '',
    completions: [],
    error: null,
    ...config,
  };
}
