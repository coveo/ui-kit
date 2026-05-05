import {createReducer} from '@reduxjs/toolkit';
import type {SpecificFacetSearchResponse} from '../../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
import {setView} from '../../../../commerce/context/context-actions.js';
import {
  handleFacetSearchClear,
  handleFacetSearchPending,
  handleFacetSearchRegistration,
  handleFacetSearchRejected,
  handleFacetSearchSetClear,
  handleFacetSearchUpdate,
} from '../../../../facets/facet-search-set/facet-search-reducer-helpers.js';
import {clearFacetSearch} from '../../../../facets/facet-search-set/generic/generic-facet-search-actions.js';
import {
  registerFacetSearch,
  updateFacetSearch,
} from '../../../../facets/facet-search-set/specific/specific-facet-search-actions.js';
import {getFacetSearchSetInitialState} from '../../../../facets/facet-search-set/specific/specific-facet-search-set-state.js';
import {fetchProductListing} from '../../../product-listing/product-listing-actions.js';
import {fetchQuerySuggestions} from '../../../query-suggest/query-suggest-actions.js';
import {executeSearch as executeCommerceSearch} from '../../../search/search-actions.js';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
  getFacetIdWithCommerceFieldSuggestionNamespace,
} from '../commerce-facet-search-actions.js';
import {
  handleCommerceFacetFieldSuggestionsFulfilled,
  handleCommerceFacetSearchFulfilled,
  handleCommerceFetchQuerySuggestionsFulfilledForRegularFacet,
} from '../commerce-facet-search-reducer-helpers.js';

export const commerceSpecificFacetSearchSetReducer = createReducer(
  getFacetSearchSetInitialState(),
  (builder) => {
    builder
      .addCase(registerFacetSearch, (state, action) => {
        const payload = action.payload;
        handleFacetSearchRegistration(state, payload, buildEmptyResponse);
      })
      .addCase(updateFacetSearch, (state, action) => {
        handleFacetSearchUpdate(state, action.payload);
      })
      .addCase(executeCommerceFacetSearch.pending, (state, action) => {
        const {facetId} = action.meta.arg;
        handleFacetSearchPending(state, facetId, action.meta.requestId);
      })
      .addCase(executeCommerceFieldSuggest.pending, (state, action) => {
        const {facetId} = action.meta.arg;
        handleFacetSearchPending(
          state,
          getFacetIdWithCommerceFieldSuggestionNamespace(facetId),
          action.meta.requestId
        );
      })
      .addCase(executeCommerceFacetSearch.rejected, (state, action) => {
        const {facetId} = action.meta.arg;
        handleFacetSearchRejected(state, facetId);
      })
      .addCase(executeCommerceFieldSuggest.rejected, (state, action) => {
        const {facetId} = action.meta.arg;
        handleFacetSearchRejected(
          state,
          getFacetIdWithCommerceFieldSuggestionNamespace(facetId)
        );
      })
      .addCase(executeCommerceFacetSearch.fulfilled, (state, action) => {
        handleCommerceFacetSearchFulfilled(
          state,
          action.payload,
          action.meta.requestId
        );
      })
      .addCase(executeCommerceFieldSuggest.fulfilled, (state, action) => {
        handleCommerceFacetFieldSuggestionsFulfilled(
          state,
          action.payload,
          action.meta.requestId,
          buildEmptyResponse
        );
      })
      .addCase(fetchQuerySuggestions.fulfilled, (state, action) => {
        handleCommerceFetchQuerySuggestionsFulfilledForRegularFacet(
          state,
          action.payload,
          action.meta.requestId,
          buildEmptyResponse
        );
      })
      .addCase(clearFacetSearch, (state, {payload}) => {
        handleFacetSearchClear(state, payload, buildEmptyResponse);
      })
      .addCase(fetchProductListing.fulfilled, (state) =>
        handleFacetSearchSetClear(state, buildEmptyResponse)
      )
      .addCase(executeCommerceSearch.fulfilled, (state) =>
        handleFacetSearchSetClear(state, buildEmptyResponse)
      )
      .addCase(setView, (state) =>
        handleFacetSearchSetClear(state, buildEmptyResponse)
      );
  }
);

function buildEmptyResponse(): SpecificFacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
  };
}
