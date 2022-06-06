import {InsightExecuteSearchThunkReturn} from '../features/insight-search/insight-search-actions';
import {InsightSearchState} from '../features/insight-search/insight-search-state';
import {logSearchboxSubmit} from '../features/query/query-analytics-actions';
import {buildMockInsightQueryResponse} from './mock-query-response';

export function buildMockInsightSearch(
  config: Partial<InsightSearchState> = {}
): InsightExecuteSearchThunkReturn {
  return {
    response: buildMockInsightQueryResponse(),
    duration: 0,
    queryExecuted: '',
    error: null,
    analyticsAction: logSearchboxSubmit(),
    ...config,
  };
}
