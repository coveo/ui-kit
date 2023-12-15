import {logSearchboxSubmit} from '../features/query/query-analytics-actions';
import {ExecuteSearchThunkReturn as LegacyExecuteSearchThunkReturn} from '../features/search/legacy/search-actions';
import {ExecuteSearchThunkReturn} from '../features/search/search-actions';
import {SearchState} from '../features/search/search-state';
import {buildMockSearchResponse} from './mock-search-response';

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
    ...config,
  };
}

export function buildMockLegacySearch(
  config: Partial<SearchState> = {}
): LegacyExecuteSearchThunkReturn {
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
