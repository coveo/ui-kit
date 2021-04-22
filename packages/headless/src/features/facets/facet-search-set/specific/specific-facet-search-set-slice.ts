import {
  handleFacetSearchRegistration,
  handleFacetSearchUpdate,
  handleFacetSearchPending,
  handleFacetSearchRejected,
  handleFacetSearchFulfilled,
} from '../facet-search-reducer-helpers';
import {SpecificFacetSearchResponse} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {registerFacetSearch} from './specific-facet-search-actions';
import {createReducer} from '@reduxjs/toolkit';
import {updateFacetSearch} from './specific-facet-search-actions';
import {getFacetSearchSetInitialState} from './specific-facet-search-set-state';
import {
  clearFacetSearchResults,
  executeFacetSearch,
} from '../generic/generic-facet-search-actions';

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
      })
      .addCase(clearFacetSearchResults, (state, {payload}) => {
        handleFacetSearchFulfilled(state, {
          facetId: payload.facetId,
          response: buildEmptyResponse(),
        });
      });
  }
);

function buildEmptyResponse(): SpecificFacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
  };
}
