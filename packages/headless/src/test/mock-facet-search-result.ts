import {FacetSearchResult} from '../api/search/facet-search/facet-search-response';

export function buildMockFacetSearchResult(
  config: Partial<FacetSearchResult> = {}
): FacetSearchResult {
  return {
    count: 0,
    displayValue: '',
    rawValue: '',
    ...config,
  };
}
