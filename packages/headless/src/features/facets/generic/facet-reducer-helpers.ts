import {AnyFacetRequest} from './interfaces/generic-facet-request';
import {FacetRequest} from '../facet-set/interfaces/request';

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

export function handleFacetDeselectAll<T extends FacetRequest>(
  facetRequest: T | undefined
) {
  if (!facetRequest) {
    return;
  }

  facetRequest.currentValues = facetRequest.currentValues.map((value) => ({
    ...value,
    state: 'idle',
  }));
  facetRequest.preventAutoSelect = true;
}

export function handleFacetUpdateNumberOfValues<T extends AnyFacetRequest>(
  facetRequest: T | undefined,
  numberOfValues: number
) {
  if (!facetRequest) {
    return;
  }

  facetRequest.numberOfValues = numberOfValues;
}
