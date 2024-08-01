import {createReducer} from '@reduxjs/toolkit';
import {CategoryFacetSearchResponse} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../commerce/facets/facet-search-set/commerce-facet-search-actions';
import {fetchProductListing} from '../../../commerce/product-listing/product-listing-actions';
import {fetchQuerySuggestions} from '../../../commerce/query-suggest/query-suggest-actions';
import {executeSearch as executeCommerceSearch} from '../../../commerce/search/search-actions';
import {executeSearch} from '../../../search/search-actions';
import {
  handleFacetSearchRegistration,
  handleFacetSearchUpdate,
  handleFacetSearchPending,
  handleFacetSearchRejected,
  handleFacetSearchFulfilled,
  handleFacetSearchClear,
  handleFacetSearchSetClear,
  handleCommerceFacetSearchFulfilled,
  handleCommerceFacetFieldSuggestionsFulfilled,
  handleCommerceFetchQuerySuggestionsFulfilledForCategoryFacet,
} from '../facet-search-reducer-helpers';
import {
  clearFacetSearch,
  executeFacetSearch,
} from '../generic/generic-facet-search-actions';
import {updateFacetSearch} from '../specific/specific-facet-search-actions';
import {namespaceCommerceFieldSuggestionFacet} from '../specific/specific-facet-search-set-slice';
import {registerCategoryFacetSearch} from './category-facet-search-actions';
import {getCategoryFacetSearchSetInitialState} from './category-facet-search-set-state';

export const categoryFacetSearchSetReducer = createReducer(
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
      .addCase(executeFacetSearch.pending, (state, action) => {
        const facetId = action.meta.arg;
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
          namespaceCommerceFieldSuggestionFacet(facetId)
        );
      })
      .addCase(executeFacetSearch.rejected, (state, action) => {
        const facetId = action.meta.arg;
        handleFacetSearchRejected(state, facetId);
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
      .addCase(executeFacetSearch.fulfilled, (state, action) => {
        handleFacetSearchFulfilled(
          state,
          action.payload,
          action.meta.requestId
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
      )
      .addCase(executeSearch.fulfilled, (state) => {
        handleFacetSearchSetClear(state, buildEmptyResponse);
      });
  }
);

function buildEmptyResponse(): CategoryFacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
  };
}
