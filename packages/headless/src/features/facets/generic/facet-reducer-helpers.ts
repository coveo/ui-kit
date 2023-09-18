import {FacetRequest} from '../facet-set/interfaces/request';
import {AnyFacetRequest} from './interfaces/generic-facet-request';
import {AnyFacetSlice} from './interfaces/generic-facet-section';

export type SpecificFacetState<
  SliceType extends AnyFacetSlice = AnyFacetSlice,
> = Record<string, SliceType>;

export function handleFacetSortCriterionUpdate<T extends AnyFacetSlice>(
  state: SpecificFacetState<T>,
  payload: {facetId: string; criterion: T['request']['sortCriteria']}
) {
  const {facetId, criterion} = payload;
  const facetRequest = state[facetId]?.request;

  if (!facetRequest) {
    return;
  }

  facetRequest.sortCriteria = criterion;
}

export function handleFacetDeselectAll(facetRequest: FacetRequest) {
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
