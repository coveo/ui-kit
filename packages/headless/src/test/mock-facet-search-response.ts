import {FacetSearchResponse} from '../api/search/facet-search/facet-search-response';

export function buildMockFacetSearchResponse(
  config: Partial<FacetSearchResponse> = {}
): FacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
    ...config,
  };
}
