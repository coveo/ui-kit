import {
  RegularFacetValue,
  NumericFacetValue,
  DateFacetValue,
  CategoryFacetValue,
} from '../features/commerce/facets/facet-set/interfaces/response';

export function buildMockCommerceRegularFacetValue(
  config: Partial<RegularFacetValue> = {}
): RegularFacetValue {
  return {
    value: '',
    state: 'idle',
    numberOfResults: 0,
    isAutoSelected: false,
    isSuggested: false,
    moreValuesAvailable: false,
    ...config,
  };
}

export function buildMockCommerceNumericFacetValue(
  config: Partial<NumericFacetValue> = {}
): NumericFacetValue {
  return {
    end: 0,
    endInclusive: false,
    isAutoSelected: false,
    isSuggested: false,
    moreValuesAvailable: false,
    numberOfResults: 0,
    start: 0,
    state: 'idle',
    ...config,
  };
}

export function buildMockCommerceDateFacetValue(
  config: Partial<DateFacetValue> = {}
): DateFacetValue {
  return {
    end: '',
    endInclusive: false,
    isAutoSelected: false,
    isSuggested: false,
    moreValuesAvailable: false,
    numberOfResults: 0,
    start: '',
    state: 'idle',
    ...config,
  };
}

export function buildMockCategoryFacetValue(
  config: Partial<CategoryFacetValue> = {}
): CategoryFacetValue {
  return {
    children: [],
    isAutoSelected: false,
    isLeafValue: false,
    isSuggested: false,
    moreValuesAvailable: false,
    numberOfResults: 0,
    path: [],
    state: 'idle',
    value: '',
    ...config,
  };
}
