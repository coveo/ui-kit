import {createReducer} from '@reduxjs/toolkit';
import {change} from '../../history/history-actions';
import {executeSearch} from '../../search/search-actions';
import {getFacetOrderInitialState} from './facet-order-state';

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
