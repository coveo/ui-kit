import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from './search-actions';
import {getCommerceSearchInitialState} from './search-state';

export const commerceSearchReducer = createReducer(
  getCommerceSearchInitialState(),

  (builder) => {
    builder
      .addCase(executeSearch.rejected, (state, action) => {
        state.error = action.payload ? action.payload : null;
        state.isLoading = false;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.error = null;
        state.facets = action.payload.response.facets;
        state.products = action.payload.response.products;
        state.responseId = action.payload.response.responseId;
        state.isLoading = false;
        state.queryExecuted = action.payload.queryExecuted ?? '';
      })
      .addCase(executeSearch.pending, (state, action) => {
        state.isLoading = true;
        state.requestId = action.meta.requestId;
      });
  }
);
