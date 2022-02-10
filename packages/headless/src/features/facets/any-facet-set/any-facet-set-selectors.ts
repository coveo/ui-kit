import {AnyFacetSection} from '../../../state/state-sections';

export const facetEnabledSelector = (state: AnyFacetSection, id: string) => {
  return state.anyFacetSet[id].enabled;
};
