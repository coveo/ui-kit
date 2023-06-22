import {
  ProductListingSection,
  SearchSection,
} from '../../../state/state-sections';
import {FacetSection} from '../../../state/state-sections';
import {getAutomaticFacetId} from '../automatic-facets/automatic-facets-utils';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';
import {buildFacetRequest} from './facet-set-slice';
import {FacetResponse, FacetValue} from './interfaces/response';

export type FacetResponseSection = SearchSection | ProductListingSection;

export const baseFacetResponseSelector = (
  state: Partial<FacetResponseSection>,
  id: string
) => {
  if ('productListing' in state && state.productListing) {
    return state.productListing.facets.results.find(
      (response) => response.facetId === id
    );
  }

  if ('search' in state && state.search) {
    const fromFacetResponse = state.search.response.facets.find(
      (response) => response.facetId === id
    );
    const fromGeneratedFacetResponse =
      state.search.response.generateAutomaticFacets?.facets.find(
        (response) => getAutomaticFacetId(response.field) === id
      );

    return fromFacetResponse || fromGeneratedFacetResponse;
  }
  return undefined;
};

export const facetRequestSelector = (state: FacetSection, id: string) => {
  const temporaryRequestWhenFacetGetsRemovedFromDOM = buildFacetRequest({
    facetId: id,
    field: '',
  });
  return (
    state.facetSet[id]?.request || temporaryRequestWhenFacetGetsRemovedFromDOM
  );
};

function isFacetResponse(
  state: FacetSection,
  response: AnyFacetResponse | undefined
): response is FacetResponse {
  return (
    !!response &&
    (response.facetId in state.facetSet ||
      getAutomaticFacetId(response.field) in state.facetSet)
  );
}
export const facetResponseSelector = (
  state: FacetResponseSection & FacetSection,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId);
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

export const isFacetLoadingResponseSelector = (state: FacetResponseSection) => {
  if ('productListing' in state) {
    return state.productListing.isLoading;
  }

  return state.search.isLoading;
};
