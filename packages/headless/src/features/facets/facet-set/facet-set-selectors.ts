import {SearchSection} from '../../../state/state-sections';
import {FacetSection} from '../../../state/state-sections';
import {FacetResponse, FacetValue} from './interfaces/response';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';

/**
 *
 * @param state
 * @param id
 * @docsection Functions
 */
export const baseFacetResponseSelector = (state: SearchSection, id: string) => {
  return state.search.response.facets.find(
    (response) => response.facetId === id
  );
};

/**
 *
 * @param state
 * @param id
 * @docsection Functions
 */
export const facetRequestSelector = (state: FacetSection, id: string) => {
  return state.facetSet[id];
};

function isFacetResponse(
  state: FacetSection,
  response: AnyFacetResponse | undefined
): response is FacetResponse {
  return !!response && response.facetId in state.facetSet;
}

/**
 *
 * @param state
 * @param facetId
 * @docsection Functions
 */
export const facetResponseSelector = (
  state: FacetSection & SearchSection,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId);
  if (isFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

/**
 *
 * @param state
 * @param facetId
 * @docsection Functions
 */
export const facetResponseSelectedValuesSelector = (
  state: SearchSection & FacetSection,
  facetId: string
): FacetValue[] => {
  const response = facetResponseSelector(state, facetId);
  if (!response) {
    return [];
  }

  return response.values.filter((value) => value.state === 'selected');
};
