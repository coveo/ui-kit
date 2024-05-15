import {isFacetResponse} from '../../../../features/commerce/facets/facet-set/facet-set-selector';
import {
  CommerceFacetSetSection,
  CommerceSearchSection,
} from '../../../../state/state-sections';

export const facetResponseSelector = (
  state: CommerceSearchSection & CommerceFacetSetSection,
  facetId: string
) => {
  const response = state.commerceSearch.facets.find(
    (response) => response.facetId === facetId
  );
  if (isFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const isFacetLoadingResponseSelector = (state: CommerceSearchSection) =>
  state.commerceSearch.isLoading;
