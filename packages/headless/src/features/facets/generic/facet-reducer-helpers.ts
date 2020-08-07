import {AnyFacetRequest} from './interfaces/generic-facet-request';

export function handleFacetSortCriterionUpdate<T extends AnyFacetRequest>(
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

export function handleFacetDeselectAll<T extends AnyFacetRequest>(
  state: Record<string, T>,
  facetId: string
) {
  const facetRequest = state[facetId];

  if (!facetRequest) {
    return;
  }

  facetRequest.currentValues.forEach(
    (request: T['currentValues'][0]) => (request.state = 'idle')
  );
  facetRequest.preventAutoSelect = true;
}
