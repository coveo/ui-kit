import {createSelector} from '@reduxjs/toolkit';
import type {
  CommerceFacetSetSection,
  CommerceSearchSection,
} from '../../../../state/state-sections.js';

export const facetResponseSelector = createSelector(
  (state: CommerceSearchSection & CommerceFacetSetSection) => state.commerceSearch.facets,
  (state: CommerceSearchSection & CommerceFacetSetSection, facetId: string) =>
    facetId in state.commerceFacetSet,
  (_state: CommerceSearchSection & CommerceFacetSetSection, facetId: string) => facetId,

  (facets, isFacetIdInFacetSet, facetId) => {
    const facetResponse = facets.find((facetResponse) => facetResponse.facetId === facetId);
    if (facetResponse && isFacetIdInFacetSet) {
      return facetResponse;
    }

    return undefined;
  }
);

export const isFacetLoadingResponseSelector = (state: CommerceSearchSection) =>
  state.commerceSearch.isLoading;
