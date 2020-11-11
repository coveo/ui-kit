import {SearchState} from '../features/search/search-state';
import {buildMockSearchResponse} from './mock-search-response';
import {logSearchboxSubmit} from '../features/query/query-analytics-actions';
import {ExecuteSearchThunkReturn} from '../features/search/search-actions';
import {buildMockSearchRequest} from './mock-search-request';
import {SearchRequest} from '../api/search/search/search-request';

export function buildMockSearch(
  config: Partial<SearchState> = {},
  requestConfig?: Partial<SearchRequest>
): ExecuteSearchThunkReturn {
  return {
    response: buildMockSearchResponse(),
    duration: 0,
    queryExecuted: requestConfig?.q ?? '',
    error: null,
    automaticallyCorrected: false,
    analyticsAction: logSearchboxSubmit(),
    requestExecuted: buildMockSearchRequest(requestConfig),
    ...config,
  };
}
