import type {
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections.js';
import {baseFacetResponseSelector} from '../../facet-set/facet-set-selectors.js';
import type {AnyFacetResponse} from '../../generic/interfaces/generic-facet-response.js';
import type {DateFacetResponse, DateFacetValue} from './interfaces/response.js';

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
