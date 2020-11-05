import {DateFacetResponse, DateFacetValue} from './interfaces/response';
import {baseFacetResponseSelector} from '../../facet-set/facet-set-selectors';
import {AnyFacetResponse} from '../../generic/interfaces/generic-facet-response';
import {
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';

function isDateFacetResponse(
  state: SearchSection & DateFacetSection,
  response: AnyFacetResponse | undefined
): response is DateFacetResponse {
  return !!response && response.facetId in state.dateFacetSet;
}

export const dataFacetResponseSelector = (
  state: SearchSection & DateFacetSection,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId);
  if (isDateFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const dateFacetSelectedValuesSelector = (
  state: SearchSection & DateFacetSection,
  facetId: string
): DateFacetValue[] => {
  const facetResponse = dataFacetResponseSelector(state, facetId);
  if (!facetResponse) {
    return [];
  }
  return facetResponse.values.filter((value) => value.state === 'selected');
};
