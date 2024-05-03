import {createReducer} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {RecommendationsCommerceSuccessResponse} from '../../../api/commerce/recommendations/recommendations-response';
import {
  fetchRecommendations,
  registerRecommendationsSlot,
  fetchMoreRecommendations,
} from './recommendations-actions';
import {
  getRecommendationsInitialState,
  getRecommendationsSliceInitialState,
  RecommendationsSlice,
  RecommendationsState,
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

        state[slotId] = buildRecommendationsSlice();
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        handleError(state, action.meta.arg.slotId, action.payload);
      })
      .addCase(fetchMoreRecommendations.rejected, (state, action) => {
        handleError(state, action.meta.arg.slotId, action.payload);
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        const slotId = action.meta.arg.slotId;
        const response = action.payload.response;

        handleFulfilled(state, slotId, response);
        const recommendations = state[slotId];

        if (!recommendations) {
          return;
        }
        recommendations.products = response.products;
      })
      .addCase(fetchMoreRecommendations.fulfilled, (state, action) => {
        const slotId = action.meta.arg.slotId;
        const response = action.payload.response;

        handleFulfilled(state, slotId, response);
        const recommendations = state[slotId];

        if (!recommendations) {
          return;
        }
        recommendations.products = recommendations.products.concat(
          response.products
        );
      })
      .addCase(fetchRecommendations.pending, (state, action) => {
        handlePending(state, action.meta.arg.slotId);
      })
      .addCase(fetchMoreRecommendations.pending, (state, action) => {
        handlePending(state, action.meta.arg.slotId);
      });
  }
);

function buildRecommendationsSlice(
  config?: Partial<RecommendationsSlice>
): RecommendationsSlice {
  return {
    ...getRecommendationsSliceInitialState(),
    ...config,
  };
}

function handleError(
  state: RecommendationsState,
  slotId: string,
  error?: CommerceAPIErrorStatusResponse
) {
  const recommendations = state[slotId];

  if (!recommendations) {
    return;
  }

  recommendations.error = error ?? null;
  recommendations.isLoading = false;
}

function handleFulfilled(
  state: RecommendationsState,
  slotId: string,
  response: RecommendationsCommerceSuccessResponse
) {
  const recommendations = state[slotId];

  if (!recommendations) {
    return;
  }

  recommendations.error = null;
  recommendations.headline = response.headline;
  recommendations.responseId = response.responseId;
  recommendations.isLoading = false;
}

function handlePending(state: RecommendationsState, slotId: string) {
  const recommendations = state[slotId];

  if (!recommendations) {
    return;
  }
  recommendations.isLoading = true;
}
