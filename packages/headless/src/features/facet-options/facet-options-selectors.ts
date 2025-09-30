import type {FacetOptionsSection} from '../../state/state-sections.js';

export const isFacetEnabledSelector = (
  state: FacetOptionsSection,
  id: string
) => {
  return state.facetOptions.facets[id]?.enabled ?? true;
};

export const selectFacetOptions = (state: {
  facetOptions?: {freezeFacetOrder?: boolean};
}) => {
  const {freezeFacetOrder} = state.facetOptions ?? {};
  return freezeFacetOrder !== undefined ? {freezeFacetOrder} : undefined;
};
