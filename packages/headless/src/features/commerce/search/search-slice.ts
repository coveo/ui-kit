import {createReducer} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {CommerceSuccessResponse} from '../../../api/commerce/common/response';
import {executeSearch, fetchMoreProducts} from './search-actions';
import {
  CommerceSearchState,
  getCommerceSearchInitialState,
} from './search-state';

export const commerceSearchReducer = createReducer(
  getCommerceSearchInitialState(),

  (builder) => {
    builder
      .addCase(executeSearch.rejected, (state, action) => {
        handleError(state, action.payload);
      })
      .addCase(fetchMoreProducts.rejected, (state, action) => {
        handleError(state, action.payload);
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        handleFulfilled(state, action.payload.response);
        state.products = action.payload.response.products;
      })
      .addCase(fetchMoreProducts.fulfilled, (state, action) => {
        handleFulfilled(state, action.payload.response);
        state.products = state.products.concat(
          action.payload.response.products
        );
      })
      .addCase(executeSearch.pending, (state, action) => {
        handlePending(state, action.meta.requestId);
      })
      .addCase(fetchMoreProducts.pending, (state, action) => {
        handlePending(state, action.meta.requestId);
      });
  }
);

function handleError(
  state: CommerceSearchState,
  error?: CommerceAPIErrorStatusResponse
) {
  state.error = error || null;
  state.isLoading = false;
}

function handlePending(state: CommerceSearchState, requestId: string) {
  state.isLoading = true;
  state.requestId = requestId;
}

function handleFulfilled(
  state: CommerceSearchState,
  response: CommerceSuccessResponse
) {
  state.error = null;
  state.facets = response.facets;
  state.responseId = response.responseId;
  state.isLoading = false;
}
