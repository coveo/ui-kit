import {OmniboxSuggestionMetadata} from '../features/query-suggest/query-suggest-analytics-actions';

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
