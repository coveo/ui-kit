import {SearchState} from '../features/search/search-state';
import {buildMockSearchResponse} from './mock-search-response';
import {ExecuteSearchThunkReturn} from '../features/search/search-actions';
import {logInterfaceLoad} from '../features/analytics/analytics-actions';

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
    analyticsAction: logInterfaceLoad(),
    ...config,
  };
}
