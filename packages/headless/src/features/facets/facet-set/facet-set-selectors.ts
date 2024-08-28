import {
  ProductListingSection,
  SearchSection,
} from '../../../state/state-sections';
import {FacetSection} from '../../../state/state-sections';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';
import {FacetResponse, FacetValue} from './interfaces/response';

export type FacetResponseSection = SearchSection | ProductListingSection;

export const baseFacetResponseSelector = (
  state: Partial<FacetResponseSection>,
  id: string
) => {
  const findById = (response: {facetId: string}) => response.facetId === id;
  if (
    'productListing' in state &&
    state.productListing &&
    'facets' in state.productListing &&
    'results' in state.productListing.facets
  ) {
    return state.productListing.facets.find(findById);
  }

  if ('search' in state && state.search) {
    return state.search.response.facets.find(findById);
  }
  return undefined;
};

export const facetRequestSelector = (state: FacetSection, id: string) => {
  return state.facetSet[id]?.request;
};

function isFacetResponse(
  state: FacetSection,
  response: AnyFacetResponse | undefined
): response is FacetResponse {
  return !!response && response.facetId in state.facetSet;
}
export const facetResponseSelector = (
  state: FacetResponseSection & FacetSection,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId) as
    | AnyFacetResponse
    | undefined;
  if (isFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const facetResponseSelectedValuesSelector = (
  state: FacetResponseSection & FacetSection,
  facetId: string
): FacetValue[] => {
  const response = facetResponseSelector(state, facetId);
  if (!response) {
    return [];
  }

  return response.values.filter((value) => value.state === 'selected');
};

export const facetResponseActiveValuesSelector = (
  state: FacetResponseSection & FacetSection,
  facetId: string
): FacetValue[] => {
  const response = facetResponseSelector(state, facetId);
  if (!response) {
    return [];
  }

  return response.values.filter((value) => value.state !== 'idle');
};

export const isFacetLoadingResponseSelector = (state: FacetResponseSection) => {
  if ('productListing' in state) {
    return state.productListing.isLoading;
  }

  return state.search.isLoading;
};
