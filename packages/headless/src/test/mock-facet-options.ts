import type {FacetOptionsState} from '../features/facet-options/facet-options-state.js';

export function buildMockFacetOptions(
  config: Partial<FacetOptionsState> = {}
): FacetOptionsState {
  return {
    freezeFacetOrder: false,
    facets: {},
    ...config,
  };
}
