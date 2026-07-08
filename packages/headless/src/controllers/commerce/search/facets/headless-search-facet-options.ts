import {createSelector} from '@reduxjs/toolkit';
import type {
  CommerceFacetSetSection,
  CommerceSearchSection,
} from '../../../../state/state-sections.js';

export const facetResponseSelector = createSelector(
  (
    state: CommerceSearchSection & CommerceFacetSetSection,
    facetId: string
  ) => ({state, facetId}),

  ({state, facetId}) => {
    const facetResponse = state.commerceSearch.facets.find(
      (facetResponse) => facetResponse.facetId === facetId
    );
    if (facetResponse && facetResponse.facetId in state.commerceFacetSet) {
      return facetResponse;
    }

    return undefined;
  }
);

export const isFacetLoadingResponseSelector = createSelector(
  (state: CommerceSearchSection) => ({state}),

  ({state}) => state.commerceSearch.isLoading
);
