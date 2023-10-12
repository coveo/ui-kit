import {createReducer} from '@reduxjs/toolkit';
import {change} from '../../history/history-actions.js';
import {executeSearch} from '../../search/search-actions.js';
import {getFacetOrderInitialState} from './facet-order-state.js';

export const facetOrderReducer = createReducer(
  getFacetOrderInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.fulfilled, (_, action) => {
        return action.payload.response.facets.map((facet) => facet.facetId);
      })
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.facetOrder ?? state;
      });
  }
);
