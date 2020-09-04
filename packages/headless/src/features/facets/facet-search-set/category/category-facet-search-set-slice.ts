import {
  FacetSearchSetState,
  FacetSearchState,
  handleFacetSearchRegistration,
  handleFacetSearchUpdate,
  handleFacetSearchPending,
  handleFacetSearchRejected,
  handleFacetSearchFulfilled,
} from '../facet-search-reducer-helpers';
import {CategoryFacetSearchResponse} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response';
import {registerCategoryFacetSearch} from './category-facet-search-actions';
import {createReducer} from '@reduxjs/toolkit';
import {
  updateFacetSearch,
  executeFacetSearch,
} from '../specific/specific-facet-search-actions';

export type CategoryFacetSearchState = FacetSearchState<
  CategoryFacetSearchResponse
>;

export type CategoryFacetSearchSetState = FacetSearchSetState<
  CategoryFacetSearchResponse
>;

export function getCategoryFacetSearchSetInitialState(): CategoryFacetSearchSetState {
  return {};
}

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
      });
  }
);

function buildEmptyResponse(): CategoryFacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
  };
}
