import {
  handleFacetSearchRegistration,
  handleFacetSearchUpdate,
  handleFacetSearchPending,
  handleFacetSearchRejected,
  handleFacetSearchFulfilled,
  handleFacetSearchClearResults,
  handleFacetSearchSetClearResults,
} from '../facet-search-reducer-helpers';
import {CategoryFacetSearchResponse} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response';
import {registerCategoryFacetSearch} from './category-facet-search-actions';
import {createReducer} from '@reduxjs/toolkit';
import {updateFacetSearch} from '../specific/specific-facet-search-actions';
import {getCategoryFacetSearchSetInitialState} from './category-facet-search-set-state';
import {
  clearFacetSearchResults,
  executeFacetSearch,
} from '../generic/generic-facet-search-actions';
import {executeSearch} from '../../../search/search-actions';

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
      .addCase(executeFacetSearch.pending, (state, action) => {
        const facetId = action.meta.arg;
        handleFacetSearchPending(state, facetId);
      })
      .addCase(executeFacetSearch.rejected, (state, action) => {
        const facetId = action.meta.arg;
        handleFacetSearchRejected(state, facetId);
      })
      .addCase(executeFacetSearch.fulfilled, (state, action) => {
        handleFacetSearchFulfilled(state, action.payload);
      })
      .addCase(clearFacetSearchResults, (state, {payload: {facetId}}) => {
        handleFacetSearchClearResults(state, {facetId}, buildEmptyResponse);
      })
      .addCase(executeSearch.fulfilled, (state) => {
        handleFacetSearchSetClearResults(state, buildEmptyResponse);
      });
  }
);

function buildEmptyResponse(): CategoryFacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
  };
}
