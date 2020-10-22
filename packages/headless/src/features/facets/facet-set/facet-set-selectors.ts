import {SearchAppState} from '../../../state/search-app-state';
import {FacetSection} from '../../../state/state-sections';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';
import {FacetResponse} from './interfaces/response';

export const baseFacetResponseSelector = (
  state: SearchAppState,
  id: string
) => {
  return state.search.response.facets.find(
    (response) => response.facetId === id
  );
};
export const facetRequestSelector = (state: FacetSection, id: string) => {
  return state.facetSet[id];
};

function isFacetResponse(
  state: SearchAppState,
  response: AnyFacetResponse | undefined
): response is FacetResponse {
  return !!response && response.facetId in state.facetSet;
}
export const facetResponseSelector = (
  state: SearchAppState,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId);
  if (isFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const facetResponseValuesSelector = (
  state: SearchAppState,
  facetId: string
) => {
  const response = facetResponseSelector(state, facetId);
  if (!response) {
    return [];
  }

  return response.values.filter((value) => value.state === 'selected');
};
