import {
  RegularFacetResponse,
  NumericFacetResponse,
} from '../features/commerce/facets/facet-set/interfaces/response';

export function buildMockCommerceRegularFacetResponse(
  config: Partial<RegularFacetResponse> = {}
): RegularFacetResponse {
  return {
    displayName: '',
    facetId: '',
    field: '',
    fromAutoSelect: false,
    isFieldExpanded: false,
    moreValuesAvailable: false,
    type: 'regular',
    values: [],
    ...config,
  };
}

export function buildMockCommerceNumericFacetResponse(
  config: Partial<NumericFacetResponse> = {}
): NumericFacetResponse {
  return {
    displayName: '',
    facetId: '',
    field: '',
    fromAutoSelect: false,
    isFieldExpanded: false,
    moreValuesAvailable: false,
    type: 'numericalRange',
    values: [],
    ...config,
  };
}
