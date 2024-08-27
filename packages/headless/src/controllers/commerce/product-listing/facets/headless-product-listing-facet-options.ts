import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceFacetSetSection,
  ProductListingSection,
} from '../../../../state/state-sections';

export const facetResponseSelector = createSelector(
  (
    state: ProductListingSection & CommerceFacetSetSection,
    facetId: string
  ) => ({state, facetId}),

  ({state, facetId}) => {
    const facetResponse = state.productListing.facets.find(
      (facetResponse) => facetResponse.facetId === facetId
    );
    if (facetResponse && facetResponse.facetId in state.commerceFacetSet) {
      return facetResponse;
    }

    return undefined;
  }
);

export const isFacetLoadingResponseSelector = createSelector(
  (state: ProductListingSection) => ({state}),

  ({state}) => state.productListing.isLoading
);
