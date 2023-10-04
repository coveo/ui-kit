import {createReducer} from '@reduxjs/toolkit';
import {fetchProductListing} from './product-listing-actions';
import {getProductListingV2InitialState} from './product-listing-state';

export const productListingV2Reducer = createReducer(
  getProductListingV2InitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.rejected, (state, action) => {
        state.error = action.payload ? action.payload : null;
        state.isLoading = false;
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        state.error = null;
        state.facets = action.payload.response.facets;
        state.products = action.payload.response.products;
        state.responseId = action.payload.response.responseId;
        state.isLoading = false;
      })
      .addCase(fetchProductListing.pending, (state) => {
        state.isLoading = true;
      });
  }
);
