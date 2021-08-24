import {createReducer} from '@reduxjs/toolkit';
import {getProductListingInitialState} from './product-listing-state';
import {executeProductListingSearch} from './product-listing-actions';

export const productListingReducer = createReducer(
  getProductListingInitialState(),

  (builder) => {
    builder
      .addCase(executeProductListingSearch.rejected, (state, action) => {
        state.error = action.payload ? action.payload : null;
        state.isLoading = false;
      })
      .addCase(executeProductListingSearch.fulfilled, (state, action) => {
        state.error = null;
        state.products = action.payload.response.items;
        state.responseId = action.payload.response.responseId;
        state.isLoading = false;
      })
      .addCase(executeProductListingSearch.pending, (state) => {
        state.isLoading = true;
      });
  }
);
