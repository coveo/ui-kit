import {
  RegularFacetValue,
  NumericFacetValue,
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
