import {
  handleFacetSearchRegistration,
  handleFacetSearchUpdate,
  handleFacetSearchPending,
  handleFacetSearchRejected,
  handleFacetSearchFulfilled,
  handleFacetSearchClear,
  handleFacetSearchSetClear,
} from '../facet-search-reducer-helpers';
import {SpecificFacetSearchResponse} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {registerFacetSearch} from './specific-facet-search-actions';
import {createReducer} from '@reduxjs/toolkit';
import {updateFacetSearch} from './specific-facet-search-actions';
import {getFacetSearchSetInitialState} from './specific-facet-search-set-state';
import {
  clearFacetSearch,
  executeFacetSearch,
} from '../generic/generic-facet-search-actions';
import {executeSearch} from '../../../search/search-actions';

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
      .addCase(clearFacetSearch, (state, {payload}) => {
        handleFacetSearchClear(state, payload, buildEmptyResponse);
      })
      .addCase(executeSearch.fulfilled, (state) => {
        handleFacetSearchSetClear(state, buildEmptyResponse);
      });
  }
);

function buildEmptyResponse(): SpecificFacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
  };
}
