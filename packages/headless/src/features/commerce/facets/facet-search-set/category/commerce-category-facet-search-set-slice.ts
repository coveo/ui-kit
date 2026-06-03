import {createReducer} from '@reduxjs/toolkit';
import type {CategoryFacetSearchResponse} from '../../../../../api/search/facet-search/category-facet-search/category-facet-search-response.js';
import {registerCategoryFacetSearch} from '../../../../facets/facet-search-set/category/category-facet-search-actions.js';
import {getCategoryFacetSearchSetInitialState} from '../../../../facets/facet-search-set/category/category-facet-search-set-state.js';
import {
  handleFacetSearchClear,
  handleFacetSearchPending,
  handleFacetSearchRegistration,
  handleFacetSearchRejected,
  handleFacetSearchSetClear,
  handleFacetSearchUpdate,
} from '../../../../facets/facet-search-set/facet-search-reducer-helpers.js';
import {clearFacetSearch} from '../../../../facets/facet-search-set/generic/generic-facet-search-actions.js';
import {updateFacetSearch} from '../../../../facets/facet-search-set/specific/specific-facet-search-actions.js';
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
  handleCommerceFetchQuerySuggestionsFulfilledForCategoryFacet,
} from '../commerce-facet-search-reducer-helpers.js';

export const commerceCategoryFacetSearchSetReducer = createReducer(
  getCategoryFacetSearchSetInitialState(),
  (builder) => {
    builder
      .addCase(registerCategoryFacetSearch, (state, action) => {
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
        handleFacetSearchPending(state, facetId, action.meta.requestId);
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
        handleCommerceFetchQuerySuggestionsFulfilledForCategoryFacet(
          state,
          action.payload,
          action.meta.requestId,
          buildEmptyResponse
        );
      })
      .addCase(clearFacetSearch, (state, {payload: {facetId}}) => {
        handleFacetSearchClear(state, {facetId}, buildEmptyResponse);
      })
      .addCase(fetchProductListing.fulfilled, (state) =>
        handleFacetSearchSetClear(state, buildEmptyResponse)
      )
      .addCase(executeCommerceSearch.fulfilled, (state) =>
        handleFacetSearchSetClear(state, buildEmptyResponse)
      );
  }
);

function buildEmptyResponse(): CategoryFacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
  };
}
