import {InsightAPIErrorStatusResponse} from '../../api/service/insight/insight-api-client';
import {
  InsightQueryResponse,
  SearchResult,
} from '../../api/service/insight/query/query-response';

export interface InsightSearchState {
  isLoading: boolean;
  error?: InsightAPIErrorStatusResponse | null;
  response: InsightQueryResponse;
  queryExecuted: string;
  duration: number;
  results: SearchResult[];
  searchResponseId: string;
  requestId: string;
}

export const getInsightSearchInitialState = (): InsightSearchState => ({
  isLoading: false,
  error: null,
  response: {
    facets: [],
    results: [],
    searchUid: '',
    totalCount: 0,
    executionReport: null,
  },
  duration: 0,
  queryExecuted: '',
  results: [],
  searchResponseId: '',
  requestId: '',
});

export interface InsightCaseContextState {
  caseContext: Record<string, string> | null;
}

export const getInsightCaseContextSearchInitialState =
  (): InsightCaseContextState => ({
    caseContext: null,
  });

export interface PaginationState {
  firstResult: number;
  numberOfResults: number;
}

export const getPaginationInitialState = (): PaginationState => ({
  firstResult: 0,
  numberOfResults: 10
});
