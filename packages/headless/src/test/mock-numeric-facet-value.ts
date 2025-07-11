import type {NumericFacetValue} from '../features/facets/range-facets/numeric-facet-set/interfaces/response.js';

export function buildMockNumericFacetValue(
  config: Partial<NumericFacetValue> = {}
): NumericFacetValue {
  return {
    start: 0,
    end: 10,
    endInclusive: false,
    numberOfResults: 0,
    state: 'idle',
    ...config,
  };
}
