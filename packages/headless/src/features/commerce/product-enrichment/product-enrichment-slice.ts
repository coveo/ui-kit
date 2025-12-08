import {createReducer} from '@reduxjs/toolkit';
import {fetchBadges} from './product-enrichment-actions.js';
import {getProductEnrichmentInitialState} from './product-enrichment-state.js';

export const productEnrichmentReducer = createReducer(
  getProductEnrichmentInitialState(),
  (builder) => {
    builder
      .addCase(fetchBadges.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBadges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.badges = action.payload.response.products;
      })
      .addCase(fetchBadges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch badges';
        state.badges = [];
      });
  }
);
