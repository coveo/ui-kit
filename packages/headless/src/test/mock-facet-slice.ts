import type {FacetSlice} from '../features/facets/facet-set/facet-set-state.js';
import {buildMockFacetRequest} from './mock-facet-request.js';

export function buildMockFacetSlice(
  config: Partial<FacetSlice> = {}
): FacetSlice {
  return {
    request: buildMockFacetRequest(),
    hasBreadcrumbs: true,
    ...config,
  };
}
