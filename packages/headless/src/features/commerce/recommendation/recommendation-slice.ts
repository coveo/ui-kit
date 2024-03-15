import {createReducer} from '@reduxjs/toolkit';
import {
  fetchRecommendation,
  updateRecommendationSlotId,
} from './recommendation-actions';
import {getRecommendationV2InitialState} from './recommendation-state';

export const recommendationV2Reducer = createReducer(
  getRecommendationV2InitialState(),

  (builder) => {
    builder
      .addCase(updateRecommendationSlotId, (state, action) => {
        state.slotId = action.payload.slotId;
      })
      .addCase(fetchRecommendation.rejected, (state, action) => {
        state.error = action.payload ? action.payload : null;
        state.isLoading = false;
      })
      .addCase(fetchRecommendation.fulfilled, (state, action) => {
        state.error = null;
        state.products = action.payload.response.products;
        state.responseId = action.payload.response.responseId;
        state.isLoading = false;
      })
      .addCase(fetchRecommendation.pending, (state, action) => {
        state.isLoading = true;
        state.requestId = action.meta.requestId;
      });
  }
);
