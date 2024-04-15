import {createReducer} from '@reduxjs/toolkit';
import {
  fetchRecommendations,
  registerRecommendationsSlot,
} from './recommendations-actions';
import {
  getRecommendationsInitialState,
  getRecommendationsSliceInitialState,
  RecommendationsSlice,
} from './recommendations-state';

export const recommendationsReducer = createReducer(
  getRecommendationsInitialState(),

  (builder) => {
    builder
      .addCase(registerRecommendationsSlot, (state, action) => {
        const slotId = action.payload.slotId;

        if (slotId in state) {
          return;
        }

        state[slotId] = buildRecommendationsSlice({slotId});
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        const recommendations = state[action.meta.arg.slotId];

        if (!recommendations) {
          return;
        }

        recommendations.error = action.payload ? action.payload : null;
        recommendations.isLoading = false;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        const recommendations = state[action.meta.arg.slotId];

        if (!recommendations) {
          return;
        }

        recommendations.error = null;
        recommendations.headline = action.payload.response.headline;
        recommendations.products = action.payload.response.products;
        recommendations.responseId = action.payload.response.responseId;
        recommendations.isLoading = false;
      })
      .addCase(fetchRecommendations.pending, (state, action) => {
        const recommendations = state[action.meta.arg.slotId];

        if (!recommendations) {
          return;
        }
        recommendations.isLoading = true;
      });
  }
);

function buildRecommendationsSlice(
  config: Partial<RecommendationsSlice>
): RecommendationsSlice {
  return {
    ...getRecommendationsSliceInitialState(),
    ...config,
  };
}
