import {createReducer} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {CommerceSuccessResponse} from '../../../api/commerce/common/response';
import {
  fetchMoreProducts,
  fetchProductListing,
} from './product-listing-actions';
import {
  ProductListingV2State,
  getProductListingV2InitialState,
} from './product-listing-state';

export const productListingV2Reducer = createReducer(
  getProductListingV2InitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.rejected, (state, action) => {
        handleError(state, action.payload);
      })
      .addCase(fetchMoreProducts.rejected, (state, action) => {
        handleError(state, action.payload);
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        handleFullfilled(state, action.payload.response);
        state.products = action.payload.response.products;
      })
      .addCase(fetchMoreProducts.fulfilled, (state, action) => {
        if (!action.payload) {
          return;
        }
        handleFullfilled(state, action.payload.response);
        state.products = state.products.concat(
          action.payload.response.products
        );
      })
      .addCase(fetchProductListing.pending, (state, action) => {
        handlePending(state, action.meta.requestId);
      })
      .addCase(fetchMoreProducts.pending, (state, action) => {
        handlePending(state, action.meta.requestId);
      });
  }
);

function handleError(
  state: ProductListingV2State,
  error?: CommerceAPIErrorStatusResponse
) {
  state.error = error || null;
  state.isLoading = false;
}

function handleFullfilled(
  state: ProductListingV2State,
  response: CommerceSuccessResponse
) {
  state.error = null;
  state.facets = response.facets;
  state.responseId = response.responseId;
  state.isLoading = false;
}

function handlePending(state: ProductListingV2State, requestId: string) {
  state.isLoading = true;
  state.requestId = requestId;
}
