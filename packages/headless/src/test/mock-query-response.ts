import {
  InsightQueryResponse,
  SearchResult,
  Facet,
  FacetValue,
} from '../api/service/insight/query/query-response';

export const buildMockInsightQueryResponse = (
  response: Partial<InsightQueryResponse> = {}
): InsightQueryResponse => ({
  searchUid: '',
  facets: [],
  results: [],
  totalCount: 0,
  executionReport: {},
  ...response,
});

export const buildMockSearchResult = (
  searchResult: Partial<SearchResult> = {}
): SearchResult => ({
  clickUri: '',
  excerpt: '',
  fields: {},
  hasHtmlVersion: false,
  percentScore: 0,
  title: '',
  uniqueId: '',
  ...searchResult,
});

export const buildMockFacet = (facet: Partial<Facet> = {}): Facet => ({
  field: '',
  indexScore: 0,
  moreValuesAvailable: false,
  values: [],
  ...facet,
});

export const buildMockFacetValue = (
  facetValue: Partial<FacetValue> = {}
): FacetValue => ({
  numberOfResults: 0,
  state: '',
  value: '',
  ...facetValue,
});
