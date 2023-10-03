import {CommerceFacetResponse} from '../api/commerce/product-listings/v2/facet';

export function buildMockCommerceFacetResponse(
  config: Partial<CommerceFacetResponse> = {}
): CommerceFacetResponse {
  return {
    type: 'regular',
    displayName: '',
    isFieldExpanded: false,
    numberOfResults: 0,
    fromAutoSelect: false,
    facetId: '',
    field: '',
    indexScore: 0,
    moreValuesAvailable: false,
    values: [],
    ...config,
  };
}
