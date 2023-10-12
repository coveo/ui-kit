import {Reducer, createReducer} from '@reduxjs/toolkit';
import {
  fetchProductListing,
  setAdditionalFields,
  setProductListingUrl,
} from './product-listing-actions.js';
import {getProductListingInitialState, ProductListingState} from './product-listing-state.js';

export const productListingReducer: Reducer<ProductListingState> =
  createReducer(
    getProductListingInitialState(),

    (builder) => {
      builder
        .addCase(setProductListingUrl, (state, action) => {
          state.url = action.payload.url;
        })
        .addCase(setAdditionalFields, (state, action) => {
          state.additionalFields = action.payload.additionalFields;
        })
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
