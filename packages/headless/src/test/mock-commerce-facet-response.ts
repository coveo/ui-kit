import {FacetResponse} from '../features/commerce/facets/facet-set/interfaces/response';

export function buildMockCommerceFacetResponse(
  config: Partial<FacetResponse> = {}
): FacetResponse {
  return {
    type: 'regular',
    displayName: '',
    isFieldExpanded: false,
    numberOfResults: 0,
    fromAutoSelect: false,
    facetId: '',
    field: '',
    moreValuesAvailable: false,
    values: [],
    ...config,
  };
}
