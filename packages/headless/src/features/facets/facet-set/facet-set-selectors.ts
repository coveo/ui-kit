import {
  ProductListingSection,
  SearchSection,
} from '../../../state/state-sections';
import {FacetSection} from '../../../state/state-sections';
import {FacetResponse, FacetValue} from './interfaces/response';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';

export const baseFacetResponseSelector = (
  state: Partial<SearchSection | ProductListingSection>,
  id: string
) => {
  if ('productListing' in state && state.productListing) {
    return state.productListing.facets.results.find(
      (response) => response.facetId === id
    );
  }

  if ('search' in state && state.search) {
    return state.search.response.facets.find(
      (response) => response.facetId === id
    );
  }
  return undefined;
};

export const facetRequestSelector = (state: FacetSection, id: string) => {
  return state.facetSet[id];
};

function isFacetResponse(
  state: FacetSection,
  response: AnyFacetResponse | undefined
): response is FacetResponse {
  return !!response && response.facetId in state.facetSet;
}
export const facetResponseSelector = (
  state: (ProductListingSection | SearchSection) & FacetSection,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId);
  if (isFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const facetResponseSelectedValuesSelector = (
  state: (ProductListingSection | SearchSection) & FacetSection,
  facetId: string
): FacetValue[] => {
  const response = facetResponseSelector(state, facetId);
  if (!response) {
    return [];
  }

  return response.values.filter((value) => value.state === 'selected');
};

export const isFacetLoadingResponseSelector = (
  state: SearchSection | ProductListingSection
) => {
  if ('productListing' in state) {
    return state.productListing.isLoading;
  }

  return state.search.isLoading;
};
