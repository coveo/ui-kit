import {createReducer} from '@reduxjs/toolkit';
import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import {fetchBadges} from './product-enrichment-actions.js';
import {
  getProductEnrichmentInitialState,
  type ProductEnrichmentState,
} from './product-enrichment-state.js';

export const productEnrichmentReducer = createReducer(
  getProductEnrichmentInitialState(),
  (builder) => {
    builder
      .addCase(fetchBadges.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBadges.fulfilled, (state, action) => {
        handleFulfilled(state);
        state.products = action.payload.response.products;
      })
      .addCase(fetchBadges.rejected, (state, action) => {
        handleError(state, action.payload);
      });
  }
);

function handleError(
  state: ProductEnrichmentState,
  error?: CommerceAPIErrorStatusResponse
) {
  state.error = error || null;
  state.isLoading = false;
  state.products = [];
}

function handleFulfilled(state: ProductEnrichmentState) {
  state.error = null;
  state.isLoading = false;
}
