import {FacetOptionsSlice} from '../features/facet-options/facet-options-state';

export function buildFacetOptionsSlice(
  config: Partial<FacetOptionsSlice> = {}
): FacetOptionsSlice {
  return {
    enabled: true,
    ...config,
  };
}
