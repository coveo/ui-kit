import type {AnyFacetRequest as AnyCommerceFacetRequest} from '../../commerce/facets/facet-set/interfaces/request.js';
import type {FacetRequest} from '../facet-set/interfaces/request.js';
import type {AnyFacetRequest} from './interfaces/generic-facet-request.js';
import type {AnyFacetSlice} from './interfaces/generic-facet-section.js';

type SpecificFacetState<SliceType extends AnyFacetSlice = AnyFacetSlice> =
  Record<string, SliceType>;

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
    ...{previousState: value.state !== 'idle' ? value.state : undefined},
    state: 'idle',
  }));
  facetRequest.preventAutoSelect = true;
}

export function handleFacetUpdateNumberOfValues<
  T extends AnyFacetRequest | AnyCommerceFacetRequest,
>(facetRequest: T | undefined, numberOfValues: number) {
  if (!facetRequest) {
    return;
  }

  facetRequest.numberOfValues = numberOfValues;
}
