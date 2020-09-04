import {
  FacetSearchSetState,
  FacetSearchState,
  handleFacetSearchRegistration,
  handleFacetSearchUpdate,
  handleFacetSearchPending,
  handleFacetSearchRejected,
  handleFacetSearchFulfilled,
} from '../facet-search-reducer-helpers';
import {SpecificFacetSearchResponse} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {registerFacetSearch} from './specific-facet-search-actions';
import {createReducer} from '@reduxjs/toolkit';
import {
  updateFacetSearch,
  executeFacetSearch,
} from './specific-facet-search-actions';

export type SpecificFacetSearchState = FacetSearchState<
  SpecificFacetSearchResponse
>;
export type SpecificFacetSearchSetState = FacetSearchSetState<
  SpecificFacetSearchResponse
>;

export function getFacetSearchSetInitialState(): SpecificFacetSearchSetState {
  return {};
}

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

function buildEmptyResponse(): SpecificFacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
  };
}
