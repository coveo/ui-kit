import {createReducer} from '@reduxjs/toolkit';
import {getProductListingInitialState} from './product-listing-state';
import {
  fetchProductListing,
  setAdditionalFields,
  setProductListingUrl,
} from './product-listing-actions';

export const productListingReducer = createReducer(
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
