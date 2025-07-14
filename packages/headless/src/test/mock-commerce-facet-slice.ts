import type {CommerceFacetSlice} from '../features/commerce/facets/facet-set/facet-set-state.js';
import {buildMockCommerceFacetRequest} from './mock-commerce-facet-request.js';

export function buildMockCommerceFacetSlice(
  config: Partial<CommerceFacetSlice> = {}
): CommerceFacetSlice {
  return {
    request: buildMockCommerceFacetRequest(),
    ...config,
  };
}
