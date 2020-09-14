import {SearchPageState} from '../../../state';

export const categoryFacetRequestSelector = (
  state: SearchPageState,
  id: string,
) => {
  return state.categoryFacetSet[id];
};
