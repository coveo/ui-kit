import type {
  FacetSection,
  SearchSection,
} from '../../../state/state-sections.js';
import type {AnyFacetResponse} from '../generic/interfaces/generic-facet-response.js';
import type {FacetResponse, FacetValue} from './interfaces/response.js';

function isFacetResponse(
  state: FacetSection,
  response: AnyFacetResponse | undefined
): response is FacetResponse {
  return !!response && response.facetId in state.facetSet;
}

export const baseFacetResponseSelector = (
  state: Partial<SearchSection>,
  id: string
) => state.search?.response.facets.find((response) => response.facetId === id);

export const facetRequestSelector = (state: FacetSection, id: string) =>
  state.facetSet[id]?.request;

export const facetResponseSelector = (
  state: SearchSection & FacetSection,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId);
  return isFacetResponse(state, response) ? response : undefined;
};

export const facetResponseSelectedValuesSelector = (
  state: SearchSection & FacetSection,
  facetId: string
) =>
  facetResponseSelector(state, facetId)?.values.filter(
    (value) => value.state === 'selected'
  ) || [];

export const facetResponseActiveValuesSelector = (
  state: SearchSection & FacetSection,
  facetId: string
): FacetValue[] =>
  facetResponseSelector(state, facetId)?.values.filter(
    (value) => value.state !== 'idle'
  ) || [];

export const isFacetLoadingResponseSelector = (state: SearchSection) =>
  state.search.isLoading;
