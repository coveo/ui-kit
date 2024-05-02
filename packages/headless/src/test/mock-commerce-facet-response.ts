import {
  RegularFacetResponse,
  NumericFacetResponse,
  DateFacetResponse,
  AnyFacetResponse,
  CategoryFacetResponse,
} from '../features/commerce/facets/facet-set/interfaces/response';

function getMockBaseCommerceFacetResponse(): Omit<
  AnyFacetResponse,
  'type' | 'values'
> {
  return {
    displayName: '',
    facetId: '',
    field: '',
    fromAutoSelect: false,
    isFieldExpanded: false,
    moreValuesAvailable: false,
    numberOfValues: 0,
  };
}

export function buildMockCommerceRegularFacetResponse(
  config: Partial<RegularFacetResponse> = {}
): RegularFacetResponse {
  return {
    ...getMockBaseCommerceFacetResponse(),
    type: 'regular',
    values: [],
    ...config,
  };
}

export function buildMockCommerceNumericFacetResponse(
  config: Partial<NumericFacetResponse> = {}
): NumericFacetResponse {
  return {
    ...getMockBaseCommerceFacetResponse(),
    type: 'numericalRange',
    values: [],
    ...config,
  };
}

export function buildMockCommerceDateFacetResponse(
  config: Partial<DateFacetResponse> = {}
): DateFacetResponse {
  return {
    ...getMockBaseCommerceFacetResponse(),
    type: 'dateRange',
    values: [],
    ...config,
  };
}

export function buildMockCategoryFacetResponse(
  config: Partial<CategoryFacetResponse> = {}
): CategoryFacetResponse {
  return {
    ...getMockBaseCommerceFacetResponse(),
    type: 'hierarchical',
    values: [],
    delimitingCharacter: '',
    ...config,
  };
}
