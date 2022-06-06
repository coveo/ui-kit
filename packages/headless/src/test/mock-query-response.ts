import {
  InsightQueryResponse,
  SearchResult,
} from '../api/service/insight/query/query-response';
import {
  AnyFacetResponse,
  AnyFacetValue,
} from '../features/facets/generic/interfaces/generic-facet-response';

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

export const buildMockFacet = (
  facet: Partial<AnyFacetResponse> = {}
): AnyFacetResponse => ({
  facetId: '',
  field: '',
  indexScore: 0,
  moreValuesAvailable: false,
  values: [],
  ...facet,
});

export const buildMockFacetValue = (
  facetValue: Partial<AnyFacetValue> = {}
): AnyFacetValue => ({
  children: [],
  end: 0,
  endInclusive: false,
  numberOfResults: 0,
  moreValuesAvailable: false,
  path: [],
  start: 0,
  state: 'idle',
  value: '',
  ...facetValue,
});
