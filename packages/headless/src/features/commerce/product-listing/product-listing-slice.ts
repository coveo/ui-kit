import {Reducer, createReducer} from '@reduxjs/toolkit';
import {fetchProductListing} from './product-listing-actions.js';
import {ProductListingV2State, getProductListingV2InitialState} from './product-listing-state.js';

export const productListingV2Reducer: Reducer<ProductListingV2State> = createReducer(
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
        state.sort = action.payload.response.sort;
        state.isLoading = false;
      })
      .addCase(fetchProductListing.pending, (state) => {
        state.isLoading = true;
      });
  }
);
