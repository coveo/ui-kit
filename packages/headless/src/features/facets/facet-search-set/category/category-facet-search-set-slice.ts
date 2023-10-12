import {Reducer, createReducer} from '@reduxjs/toolkit';
import {CategoryFacetSearchResponse} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response.js';
import {executeSearch} from '../../../search/search-actions.js';
import {
  handleFacetSearchRegistration,
  handleFacetSearchUpdate,
  handleFacetSearchPending,
  handleFacetSearchRejected,
  handleFacetSearchFulfilled,
  handleFacetSearchClear,
  handleFacetSearchSetClear,
} from '../facet-search-reducer-helpers.js';
import {
  clearFacetSearch,
  executeFacetSearch,
} from '../generic/generic-facet-search-actions.js';
import {updateFacetSearch} from '../specific/specific-facet-search-actions.js';
import {registerCategoryFacetSearch} from './category-facet-search-actions.js';
import {CategoryFacetSearchSetState, getCategoryFacetSearchSetInitialState} from './category-facet-search-set-state.js';

export const categoryFacetSearchSetReducer : Reducer<CategoryFacetSearchSetState> = createReducer(
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
      .addCase(executeFacetSearch.pending, (state, action) => {
        const facetId = action.meta.arg;
        handleFacetSearchPending(state, facetId, action.meta.requestId);
      })
      .addCase(executeFacetSearch.rejected, (state, action) => {
        const facetId = action.meta.arg;
        handleFacetSearchRejected(state, facetId);
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
