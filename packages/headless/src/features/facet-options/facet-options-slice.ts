import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions';
import {executeSearch} from '../search/search-actions';
import {FacetOptions} from './facet-options';
import {updateFacetOptions} from './facet-options-actions';

export type FacetOptionsState = FacetOptions;

export function getFacetOptionsInitialState(): FacetOptionsState {
  return {
    freezeFacetOrder: false,
  };
}

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
      .addCase(change.fulfilled, (_, action) => action.payload.facetOptions);
  }
);
