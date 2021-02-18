import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions';
import {executeSearch} from '../search/search-actions';
import {updateFacetOptions} from './facet-options-actions';
import {getFacetOptionsInitialState} from './facet-options-state';

export const facetOptionsReducer = createReducer(
  getFacetOptionsInitialState(),
  (builder) => {
    builder
      .addCase(updateFacetOptions, (state, action) => {
        return {...state, ...action.payload};
      })
      .addCase(executeSearch.fulfilled, (state) => {
        state.freezeFacetOrder = false;
      })
      .addCase(executeSearch.rejected, (state) => {
        state.freezeFacetOrder = false;
      })
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.facetOptions ?? state
      );
  }
);
