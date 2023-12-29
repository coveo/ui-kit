import {CommerceFacetSetSection} from '../../../../state/state-sections';
import {AnyFacetResponse} from './interfaces/response';

export function isFacetResponse(
  state: CommerceFacetSetSection,
  response: AnyFacetResponse | undefined
): response is AnyFacetResponse {
  return !!response && response.facetId in state.commerceFacetSet;
}
