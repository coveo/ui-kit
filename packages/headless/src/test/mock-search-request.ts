import {SearchRequest} from '../api/search/search/search-request';

export function buildMockSearchRequest(
  config: Partial<SearchRequest> = {}
): SearchRequest {
  return {
    context: {},
    enableDidYouMean: false,
    facets: [],
    firstResult: 0,
    numberOfResults: 10,
    q: '',
    sortCriteria: 'relevancy',
    pipeline: '',
    ...config,
  };
}
