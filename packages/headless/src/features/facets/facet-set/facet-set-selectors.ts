import {SearchPageState} from '../../../state';

export const facetSelector = (state: SearchPageState, id: string) => {
  return state.search.response.facets.find(
    (response) => response.facetId === id
  );
};

export const facetRequestSelector = (state: SearchPageState, id: string) => {
  return state.facetSet[id];
};
