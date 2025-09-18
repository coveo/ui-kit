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
  if (state.facetOptions?.freezeFacetOrder === undefined) {
    return undefined;
  }

  return {
    freezeFacetOrder: state.facetOptions.freezeFacetOrder,
  };
};
