import {AnyFacetResponse, FacetResponse} from '../api/commerce/product-listings/v2/facet';

export function buildMockCommerceFacetResponse(
  config: Partial<FacetResponse> = {}
): AnyFacetResponse {
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
