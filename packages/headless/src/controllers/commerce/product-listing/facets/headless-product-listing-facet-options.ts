import {isFacetResponse} from '../../../../features/commerce/facets/facet-set/facet-set-selector';
import {
  CommerceFacetSetSection,
  ProductListingV2Section,
} from '../../../../state/state-sections';

export const facetResponseSelector = (
  state: ProductListingV2Section & CommerceFacetSetSection,
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

export const isFacetLoadingResponseSelector = (
  state: ProductListingV2Section
) => state.productListing.isLoading;
