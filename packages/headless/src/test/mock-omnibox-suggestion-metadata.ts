import type {OmniboxSuggestionMetadata} from '../features/query-suggest/query-suggest-analytics-actions.js';

export function buildMockOmniboxSuggestionMetadata(
  config: Partial<OmniboxSuggestionMetadata> = {}
): OmniboxSuggestionMetadata {
  return {
    partialQueries: [],
    partialQuery: '',
    suggestionRanking: -1,
    suggestions: [],
    querySuggestResponseId: '',
    ...config,
  };
}
