import {isFacetResponse} from '../../../../features/commerce/facets/facet-set/facet-set-selector';
import {
  CommerceFacetSetSection,
  ProductListingSection,
} from '../../../../state/state-sections';

export const facetResponseSelector = (
  state: ProductListingSection & CommerceFacetSetSection,
  facetId: string
) => {
  const response = state.productListing.facets.find(
    (response) => response.facetId === facetId
  );
  if (isFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const isFacetLoadingResponseSelector = (state: ProductListingSection) =>
  state.productListing.isLoading;
