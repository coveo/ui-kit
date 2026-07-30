import {createSelector} from '@reduxjs/toolkit';
import type {
  CommerceFacetSetSection,
  ProductListingSection,
} from '../../../../state/state-sections.js';

export const facetResponseSelector = createSelector(
  (state: ProductListingSection & CommerceFacetSetSection) => state.productListing.facets,
  (state: ProductListingSection & CommerceFacetSetSection, facetId: string) =>
    facetId in state.commerceFacetSet,
  (_state: ProductListingSection & CommerceFacetSetSection, facetId: string) => facetId,

  (facets, isFacetIdInFacetSet, facetId) => {
    const facetResponse = facets.find((facetResponse) => facetResponse.facetId === facetId);
    if (facetResponse && isFacetIdInFacetSet) {
      return facetResponse;
    }

    return undefined;
  }
);

export const isFacetLoadingResponseSelector = (state: ProductListingSection) =>
  state.productListing.isLoading;
