import {FacetOptionsSection} from '../../state/state-sections';

export const isFacetEnabledSelector = (
  state: FacetOptionsSection,
  id: string
) => {
  return state.facetOptions.facets[id]?.enabled ?? true;
};
