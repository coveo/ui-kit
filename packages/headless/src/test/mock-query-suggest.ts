import {QuerySuggestState} from '../state';

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
