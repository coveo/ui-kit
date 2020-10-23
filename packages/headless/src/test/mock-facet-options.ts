import {FacetOptionsState} from '../features/facet-options/facet-options-state';

export function buildMockFacetOptions(
  config: Partial<FacetOptionsState> = {}
): FacetOptionsState {
  return {
    freezeFacetOrder: false,
    ...config,
  };
}
