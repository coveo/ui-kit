import {SearchResponse} from '../api/search/search/search-response';
import {emptyCorrection} from '../features/did-you-mean/did-you-mean-slice';

export function buildMockSearchResponse(
  config: Partial<SearchResponse> = {}
): SearchResponse {
  return {
    results: [],
    searchUid: '',
    totalCountFiltered: 0,
    facets: [],
    queryCorrections: [emptyCorrection()],
    ...config,
  };
}
