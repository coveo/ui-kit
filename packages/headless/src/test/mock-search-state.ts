import {
  emptyQuestionAnswer,
  type SearchState,
} from '../features/search/search-state.js';
import {buildMockSearchResponse} from './mock-search-response.js';

export function buildMockSearchState(
  config: Partial<SearchState>
): SearchState {
  return {
    response: buildMockSearchResponse(),
    duration: 0,
    queryExecuted: '',
    error: null,
    automaticallyCorrected: false,
    isLoading: false,
    results: [],
    searchResponseId: '',
    requestId: '',
    questionAnswer: emptyQuestionAnswer(),
    extendedResults: {},
    searchAction: undefined,
    ...config,
  };
}
