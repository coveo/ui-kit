import type {NumericFacetSlice} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state.js';
import {buildMockNumericFacetRequest} from './mock-numeric-facet-request.js';

export function buildMockNumericFacetSlice(
  config: Partial<NumericFacetSlice> = {}
): NumericFacetSlice {
  return {
    request: buildMockNumericFacetRequest(),
    ...config,
  };
}
