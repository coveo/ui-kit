import {createReducer} from '@reduxjs/toolkit';
import {
  fetchRecommendations,
  updateRecommendationsSlotId,
} from './recommendations-actions';
import {getRecommendationsInitialState} from './recommendations-state';

export const recommendationsReducer = createReducer(
  getRecommendationsInitialState(),

  (builder) => {
    builder
      .addCase(updateRecommendationsSlotId, (state, action) => {
        state.slotId = action.payload.slotId;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.error = action.payload ? action.payload : null;
        state.isLoading = false;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.error = null;
        state.headline = action.payload.response.headline;
        state.products = action.payload.response.products;
        state.responseId = action.payload.response.responseId;
        state.isLoading = false;
      })
      .addCase(fetchRecommendations.pending, (state, action) => {
        state.isLoading = true;
        state.requestId = action.meta.requestId;
      });
  }
);
