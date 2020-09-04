import {SpecificFacetSearchResult} from '../api/search/facet-search/specific-facet-search/specific-facet-search-response';

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
