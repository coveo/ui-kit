import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {
  baseFacetResponseSelector,
  isFacetResponse,
} from '../facet-set/facet-set-selector';
import {
  AnyFacetResponse,
  NumericFacetResponse,
  NumericFacetValue,
} from '../facet-set/interfaces/response';

function isNumericFacetResponse(
  engine: CommerceEngine,
  response?: AnyFacetResponse
): response is NumericFacetResponse {
  const state = engine[stateKey];
  return (
    isFacetResponse(state, response) &&
    state.commerceFacetSet[response.facetId].request.type === 'numericalRange' // TODO: not sure since we are already doing this check above
  );
}

/**
 * TODO: TEST IT
 */

// TODO: try to reuse existing code with templating
export const numericFacetResponseSelector = (
  engine: CommerceEngine,
  facetId: string
) => {
  const response = baseFacetResponseSelector(engine, facetId); // TODO: last piece
  //TODO: do we really need to check if the facet response is of type numeric facet
  if (isNumericFacetResponse(engine, response)) {
    return response;
  }

  return undefined;
};

export const numericFacetSelectedValuesSelector = (
  engine: CommerceEngine,
  facetId: string
): NumericFacetValue[] => {
  // TODO: maybe use a memoized version of the function
  const facetResponse = numericFacetResponseSelector(engine, facetId) || {
    values: [],
  };
  return facetResponse.values.filter((value) => value.state === 'selected');
};
