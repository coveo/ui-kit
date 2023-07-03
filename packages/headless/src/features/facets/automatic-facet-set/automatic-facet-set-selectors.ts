import {AutomaticFacetSetState} from './automatic-facet-set-state';

export const automaticFacetSelector = (
  state: AutomaticFacetSetState | undefined,
  field: string
) => {
  return state?.facets[field];
};
