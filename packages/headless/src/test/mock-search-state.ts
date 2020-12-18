import {SearchState} from '../features/search/search-state';
import {buildMockSearchResponse} from './mock-search-response';

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
    ...config,
  };
}
