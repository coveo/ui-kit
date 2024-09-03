import {SearchSection} from '../../../state/state-sections';
import {FacetSection} from '../../../state/state-sections';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';
import {FacetResponse, FacetValue} from './interfaces/response';

export const baseFacetResponseSelector = (
  state: Partial<SearchSection>,
  id: string
) => {
  const findById = (response: {facetId: string}) => response.facetId === id;

  if ('search' in state && state.search) {
    return state.search.response.facets.find(findById);
  }
  return undefined;
};

export const facetRequestSelector = (state: FacetSection, id: string) => {
  return state.facetSet[id]?.request;
};

function isFacetResponse(
  state: FacetSection,
  response: AnyFacetResponse | undefined
): response is FacetResponse {
  return !!response && response.facetId in state.facetSet;
}
export const facetResponseSelector = (
  state: SearchSection & FacetSection,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId);
  if (isFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const facetResponseSelectedValuesSelector = (
  state: SearchSection & FacetSection,
  facetId: string
) => {
  const response = facetResponseSelector(state, facetId);
  if (!response) {
    return [];
  }

  return response.values.filter((value) => value.state === 'selected');
};

export const facetResponseActiveValuesSelector = (
  state: SearchSection & FacetSection,
  facetId: string
): FacetValue[] => {
  const response = facetResponseSelector(state, facetId);
  if (!response) {
    return [];
  }

  return response.values.filter((value) => value.state !== 'idle');
};

export const isFacetLoadingResponseSelector = (state: SearchSection) => {
  return state.search.isLoading;
};
