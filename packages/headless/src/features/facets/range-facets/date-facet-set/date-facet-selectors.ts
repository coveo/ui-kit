import {DateFacetResponse, DateFacetApiValue} from './interfaces/response';
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

export const dateFacetResponseSelector = (
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
): DateFacetApiValue[] => {
  const facetResponse = dateFacetResponseSelector(state, facetId);
  if (!facetResponse) {
    return [];
  }
  return facetResponse.values.filter((value) => value.state === 'selected');
};
