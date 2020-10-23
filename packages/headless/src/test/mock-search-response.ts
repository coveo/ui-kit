import {SearchResponseSuccess} from '../api/search/search/search-response';
import {emptyCorrection} from '../features/did-you-mean/did-you-mean-state';

export function buildMockSearchResponse(
  config: Partial<SearchResponseSuccess> = {}
): SearchResponseSuccess {
  return {
    results: [],
    searchUid: '',
    totalCountFiltered: 0,
    facets: [],
    queryCorrections: [emptyCorrection()],
    ...config,
  };
}
