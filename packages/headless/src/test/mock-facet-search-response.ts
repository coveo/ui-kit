import {FacetSearchResponse} from '../api/search/facet-search/api/response';

export function buildMockFacetSearchResponse(
  config: Partial<FacetSearchResponse> = {}
): FacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
    ...config,
  };
}
