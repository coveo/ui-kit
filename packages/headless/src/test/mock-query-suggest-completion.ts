import type {QuerySuggestCompletion} from '../api/search/query-suggest/query-suggest-response.js';

export function buildMockQuerySuggestCompletion(
  config: Partial<QuerySuggestCompletion> = {}
): QuerySuggestCompletion {
  return {
    expression: '',
    score: 0,
    highlighted: '',
    executableConfidence: 1,
    ...config,
  };
}
