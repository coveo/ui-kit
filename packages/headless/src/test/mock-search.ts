import {logSearchboxSubmit} from '../features/query/query-analytics-actions.js';
import {ExecuteSearchThunkReturn} from '../features/search/search-actions.js';
import {SearchState} from '../features/search/search-state.js';
import {buildMockSearchResponse} from './mock-search-response.js';

export function buildMockSearch(
  config: Partial<SearchState> = {}
): ExecuteSearchThunkReturn {
  return {
    response: buildMockSearchResponse(),
    duration: 0,
    queryExecuted: '',
    error: null,
    automaticallyCorrected: false,
    originalQuery: '',
    analyticsAction: logSearchboxSubmit(),
    ...config,
  };
}
