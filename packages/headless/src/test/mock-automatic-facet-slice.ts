import type {AutomaticFacetSlice} from '../features/facets/automatic-facet-set/automatic-facet-set-state.js';
import {buildMockAutomaticFacetResponse} from './mock-automatic-facet-response.js';

export function buildMockAutomaticFacetSlice(
  config: Partial<AutomaticFacetSlice> = {}
): AutomaticFacetSlice {
  return {
    response: buildMockAutomaticFacetResponse(),
    ...config,
  };
}
