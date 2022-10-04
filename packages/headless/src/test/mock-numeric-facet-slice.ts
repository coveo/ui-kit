import {NumericFacetSlice} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {buildMockNumericFacetRequest} from './mock-numeric-facet-request';

export function buildMockNumericFacetSlice(
  config: Partial<NumericFacetSlice> = {}
): NumericFacetSlice {
  return {
    request: buildMockNumericFacetRequest(),
    ...config,
  };
}
