import type {FacetOptionsSlice} from '../features/facet-options/facet-options-state.js';

export function buildFacetOptionsSlice(
  config: Partial<FacetOptionsSlice> = {}
): FacetOptionsSlice {
  return {
    enabled: true,
    tabs: {},
    ...config,
  };
}
