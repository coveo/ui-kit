import {SpecificFacetSearchResponse} from '../api/search/facet-search/specific-facet-search/specific-facet-search-response';

export function buildMockFacetSearchResponse(
  config: Partial<SpecificFacetSearchResponse> = {}
): SpecificFacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
    ...config,
  };
}
