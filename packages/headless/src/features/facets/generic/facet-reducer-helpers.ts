import {FacetRequest} from '../facet-set/interfaces/request';
import {RangeFacetRequest} from '../range-facets/generic/interfaces/range-facet';

export function handleFacetSortCriterionUpdate<
  T extends FacetRequest | RangeFacetRequest
>(
  state: Record<string, T>,
  payload: {facetId: string; criterion: T['sortCriteria']}
) {
  const {facetId, criterion} = payload;
  const facetRequest = state[facetId];

  if (!facetRequest) {
    return;
  }

  facetRequest.sortCriteria = criterion;
}
