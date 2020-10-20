import {SearchAppState} from '../../../state/search-app-state';

export const categoryFacetRequestSelector = (
  state: SearchAppState,
  id: string
) => {
  return state.categoryFacetSet[id];
};
