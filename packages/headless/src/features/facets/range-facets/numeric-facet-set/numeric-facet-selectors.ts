import {NumericFacetResponse, NumericFacetValue} from './interfaces/response';
import {baseFacetResponseSelector} from '../../facet-set/facet-set-selectors';
import {AnyFacetResponse} from '../../generic/interfaces/generic-facet-response';
import {
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections';

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

export const numericFacetSelectedValuesSelector = (
  state: SearchSection & NumericFacetSection,
  facetId: string
): NumericFacetValue[] => {
  const facetResponse = numericFacetResponseSelector(state, facetId);
  if (!facetResponse) {
    return [];
  }
  return facetResponse.values.filter((value) => value.state === 'selected');
};
