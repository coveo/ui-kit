import type {SpecificFacetSearchResult} from '../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';

export function buildMockFacetSearchResult(
  config: Partial<SpecificFacetSearchResult> = {}
): SpecificFacetSearchResult {
  return {
    count: 0,
    displayValue: '',
    rawValue: '',
    ...config,
  };
}
