import {SearchResponse} from '../api/search/search/search-response';

export function buildMockSearchResponse(
  config: Partial<SearchResponse> = {}
): SearchResponse {
  return {
    results: [],
    ...config,
  };
}
