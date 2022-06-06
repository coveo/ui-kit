import {InsightAPIErrorStatusResponse} from '../../api/service/insight/insight-api-client';
import {
  InsightQueryResponse,
  SearchResult,
} from '../../api/service/insight/query/query-response';

export interface InsightSearchState {
  isLoading: boolean;
  error?: InsightAPIErrorStatusResponse;
  response: InsightQueryResponse;
  queryExecuted: string;
  duration: number;
  results: SearchResult[];
  searchResponseId: string;
  requestId: string;
}

export const getInsightSearchInitialState = (): InsightSearchState => ({
  isLoading: false,
  error: undefined,
  response: {
    facets: [],
    results: [],
    searchUid: '',
    totalCount: 0,
    executionReport: {},
  },
  duration: 0,
  queryExecuted: '',
  results: [],
  searchResponseId: '',
  requestId: '',
});

export interface InsightCaseContextState {
  caseContext: Record<string, string>;
}

export const getInsightCaseContextSearchInitialState =
  (): InsightCaseContextState => ({
    caseContext: {},
  });
