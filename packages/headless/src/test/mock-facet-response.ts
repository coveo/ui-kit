import {FacetResponse} from '../features/facets/facet-set/facet-set-interfaces';

export function buildMockFacetResponse(
  config: Partial<FacetResponse> = {}
): FacetResponse {
  return {
    facetId: '',
    field: '',
    indexScore: 0,
    moreValuesAvailable: false,
    values: [],
    ...config,
  };
}
