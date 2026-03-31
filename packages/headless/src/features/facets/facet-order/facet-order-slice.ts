import {type AnyAction, createReducer} from '@reduxjs/toolkit';
import {change} from '../../history/history-actions.js';
import {executeSearch} from '../../search/search-actions.js';
import {
  type FacetOrderState,
  getFacetOrderInitialState,
} from './facet-order-state.js';

export const facetOrderReducer = createReducer(
  getFacetOrderInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.fulfilled, handleQueryFulfilled)
      .addCase(change.fulfilled, (state, action) => {
        return action.payload?.facetOrder ?? state;
      });
  }
);

function handleQueryFulfilled(_: FacetOrderState, action: AnyAction) {
  return action.payload.response.facets.map(
    (facet: {facetId: string}) => facet.facetId
  );
}
