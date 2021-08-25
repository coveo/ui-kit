import {createReducer} from '@reduxjs/toolkit';
import {getProductListingInitialState} from './product-listing-state';
import {fetchProductListing} from './product-listing-actions';

export const productListingReducer = createReducer(
  getProductListingInitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.rejected, (state, action) => {
        state.error = action.payload ? action.payload : null;
        state.isLoading = false;
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        state.error = null;
        state.products = action.payload.response.items;
        state.responseId = action.payload.response.responseId;
        state.isLoading = false;
      })
      .addCase(fetchProductListing.pending, (state) => {
        state.isLoading = true;
      });
  }
);
