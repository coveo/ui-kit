import {FacetOptionsState} from '../features/facet-options/facet-options-slice';

export function buildMockFacetOptions(
  config: Partial<FacetOptionsState> = {}
): FacetOptionsState {
  return {
    freezeFacetOrder: false,
    ...config,
  };
}
