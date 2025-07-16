import {logSearchboxSubmit} from '../features/query/query-analytics-actions.js';
import type {ExecuteSearchThunkReturn as LegacyExecuteSearchThunkReturn} from '../features/search/legacy/search-actions.js';
import type {ExecuteSearchThunkReturn} from '../features/search/search-actions.js';
import type {SearchState} from '../features/search/search-state.js';
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
