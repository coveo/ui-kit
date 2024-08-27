import {createReducer} from '@reduxjs/toolkit';
import {SpecificFacetSearchResponse} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {setView} from '../../../commerce/context/context-actions';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
  getFacetIdWithCommerceFieldSuggestionNamespace,
} from '../../../commerce/facets/facet-search-set/commerce-facet-search-actions';
import {fetchProductListing} from '../../../commerce/product-listing/product-listing-actions';
import {fetchQuerySuggestions} from '../../../commerce/query-suggest/query-suggest-actions';
import {executeSearch as executeCommerceSearch} from '../../../commerce/search/search-actions';
import {executeSearch} from '../../../search/search-actions';
import {
  handleCommerceFacetFieldSuggestionsFulfilled,
  handleCommerceFacetSearchFulfilled,
  handleCommerceFetchQuerySuggestionsFulfilledForRegularFacet,
  handleFacetSearchClear,
  handleFacetSearchFulfilled,
  handleFacetSearchPending,
  handleFacetSearchRegistration,
  handleFacetSearchRejected,
  handleFacetSearchSetClear,
  handleFacetSearchUpdate,
} from '../facet-search-reducer-helpers';
import {
  clearFacetSearch,
  executeFacetSearch,
} from '../generic/generic-facet-search-actions';
import {
  registerFacetSearch,
  updateFacetSearch,
} from './specific-facet-search-actions';
import {getFacetSearchSetInitialState} from './specific-facet-search-set-state';

export const specificFacetSearchSetReducer = createReducer(
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
          getFacetIdWithCommerceFieldSuggestionNamespace(facetId)
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
        handleCommerceFetchQuerySuggestionsFulfilledForRegularFacet(
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
      .addCase(clearFacetSearch, (state, {payload}) => {
        handleFacetSearchClear(state, payload, buildEmptyResponse);
      })
      .addCase(executeSearch.fulfilled, (state) => {
        handleFacetSearchSetClear(state, buildEmptyResponse);
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
