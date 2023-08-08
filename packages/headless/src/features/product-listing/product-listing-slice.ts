import {createReducer} from '@reduxjs/toolkit';
import {
    fetchProductListing, fetchProductListingV2,
    setAdditionalFields, setProductListingId,
    setProductListingUrl,
} from './product-listing-actions';
import {getProductListingInitialState, getProductListingV2InitialState} from './product-listing-state';

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

export const productListingV2Reducer = createReducer(
    getProductListingV2InitialState(),

    (builder) => {
      builder
          .addCase(setProductListingId, (state, action) => {
            state.listingId = action.payload.id;
          })
          .addCase(fetchProductListingV2.rejected, (state, action) => {
              state.error = action.payload ? action.payload : null;
              state.isLoading = false;
          })
          .addCase(fetchProductListingV2.fulfilled, (state, action) => {
              state.error = null;
              state.facets = action.payload.response.facets;
              state.products = action.payload.response.products;
              state.responseId = action.payload.response.responseId;
              state.isLoading = false;
          })
          .addCase(fetchProductListingV2.pending, (state) => {
              state.isLoading = true;
          });
    }
);
