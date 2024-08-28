import {
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {baseFacetResponseSelector} from '../../facet-set/facet-set-selectors';
import {AnyFacetResponse} from '../../generic/interfaces/generic-facet-response';
import {NumericFacetResponse, NumericFacetValue} from './interfaces/response';

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
  const response = baseFacetResponseSelector(state, facetId) as
    | AnyFacetResponse
    | undefined;
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
