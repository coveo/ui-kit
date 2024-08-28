import {
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {baseFacetResponseSelector} from '../../facet-set/facet-set-selectors';
import {AnyFacetResponse} from '../../generic/interfaces/generic-facet-response';
import {DateFacetResponse, DateFacetValue} from './interfaces/response';

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
  const response = baseFacetResponseSelector(state, facetId) as
    | AnyFacetResponse
    | undefined;
  if (isDateFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const dateFacetSelectedValuesSelector = (
  state: SearchSection & DateFacetSection,
  facetId: string
): DateFacetValue[] => {
  const facetResponse = dateFacetResponseSelector(state, facetId) || {
    values: [],
  };
  return facetResponse.values.filter((value) => value.state === 'selected');
};

export const dateFacetActiveValuesSelector = (
  state: SearchSection & DateFacetSection,
  facetId: string
): DateFacetValue[] => {
  const facetResponse = dateFacetResponseSelector(state, facetId) || {
    values: [],
  };
  return facetResponse.values.filter((value) => value.state !== 'idle');
};

export const dateFacetExcludedValuesSelector = (
  state: SearchSection & DateFacetSection,
  facetId: string
): DateFacetValue[] => {
  const facetResponse = dateFacetResponseSelector(state, facetId) || {
    values: [],
  };
  return facetResponse.values.filter((value) => value.state === 'excluded');
};
