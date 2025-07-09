import type {
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections.js';
import {baseFacetResponseSelector} from '../../facet-set/facet-set-selectors.js';
import type {AnyFacetResponse} from '../../generic/interfaces/generic-facet-response.js';
import type {
  NumericFacetResponse,
  NumericFacetValue,
} from './interfaces/response.js';

function isNumericFacetResponse(
  state: SearchSection & NumericFacetSection,
  response: AnyFacetResponse | undefined
): response is NumericFacetResponse {
  return !!response && response.facetId in state.numericFacetSet;
}

export const numericFacetResponseSelector = (
  state: SearchSection & NumericFacetSection,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId);
  if (isNumericFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const numericFacetActiveValuesSelector = (
  state: SearchSection & NumericFacetSection,
  facetId: string
): NumericFacetValue[] => {
  const facetResponse = numericFacetResponseSelector(state, facetId) || {
    values: [],
  };
  return facetResponse.values.filter((value) => value.state !== 'idle');
};

export const numericFacetSelectedValuesSelector = (
  state: SearchSection & NumericFacetSection,
  facetId: string
): NumericFacetValue[] => {
  const facetResponse = numericFacetResponseSelector(state, facetId) || {
    values: [],
  };
  return facetResponse.values.filter((value) => value.state === 'selected');
};

export const numericFacetExcludedValuesSelector = (
  state: SearchSection & NumericFacetSection,
  facetId: string
): NumericFacetValue[] => {
  const facetResponse = numericFacetResponseSelector(state, facetId) || {
    values: [],
  };
  return facetResponse.values.filter((value) => value.state === 'excluded');
};
