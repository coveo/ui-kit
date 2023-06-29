import {AutomaticFacetsSetState} from './automatic-facet-set-state';

export const automaticFacetSelector = (
  state: AutomaticFacetsSetState | undefined,
  field: string
) => {
  return state?.facets[field];
};
