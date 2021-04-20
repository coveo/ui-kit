import {SearchState} from '../features/search/search-state';
import {buildMockSearchResponse} from './mock-search-response';
import {logSearchboxSubmit} from '../features/query/query-analytics-actions';
import {ExecuteSearchThunkReturn} from '../features/search/search-actions';

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
