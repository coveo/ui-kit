import {AnyFacetRequest} from './interfaces/generic-facet-request';
import {FacetRequest} from '../facet-set/interfaces/request';
import {CategoryFacetRequest} from '../category-facet-set/interfaces/request';
import * as FacetReducers from './facet-reducer-helpers';

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

export function handleFacetDeselectAll<
  T extends FacetRequest | CategoryFacetRequest
>(state: Record<string, T>, facetId: string) {
  const facetRequest = state[facetId];

  if (!facetRequest) {
    return;
  }

  facetRequest.currentValues = [];
  facetRequest.preventAutoSelect = true;
}

export function handleFacetUpdateNumberOfValues<T extends AnyFacetRequest>(
  state: Record<string, T>,
  payload: {facetId: string; numberOfValues: number}
) {
  const {facetId, numberOfValues} = payload;
  const facetRequest = state[facetId];

  if (!facetRequest) {
    return;
  }

  facetRequest.numberOfValues = numberOfValues;
}

export function handleDeselectAllFacets<
  T extends FacetRequest | CategoryFacetRequest
>(state: Record<string, T>) {
  Object.keys(state).forEach((facetId) => {
    FacetReducers.handleFacetDeselectAll<T>(state, facetId);
  });
}
