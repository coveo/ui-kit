import {createReducer} from '@reduxjs/toolkit';
import {
  getProductRecommendations,
  setProductRecommendationsSkus,
  setProductRecommendationsBrandFilter,
  setProductRecommendationsCategoryFilter,
  setProductRecommendationsMaxNumberOfRecommendations,
  setProductRecommendationsAdditionalFields,
  setProductRecommendationsRecommenderId,
} from './product-recommendations-actions';
import {getProductRecommendationsInitialState} from './product-recommendations-state';

export const productRecommendationsReducer = createReducer(
  getProductRecommendationsInitialState(),

  (builder) => {
    builder
      .addCase(setProductRecommendationsRecommenderId, (state, action) => {
        state.id = action.payload.id;
      })
      .addCase(setProductRecommendationsSkus, (state, action) => {
        state.skus = action.payload.skus;
      })
      .addCase(setProductRecommendationsBrandFilter, (state, action) => {
        state.filter.brand = action.payload.brand;
      })
      .addCase(setProductRecommendationsCategoryFilter, (state, action) => {
        state.filter.category = action.payload.category;
      })
      .addCase(
        setProductRecommendationsMaxNumberOfRecommendations,
        (state, action) => {
          state.maxNumberOfRecommendations = action.payload.number;
        }
      )
      .addCase(setProductRecommendationsAdditionalFields, (state, action) => {
        state.additionalFields = action.payload.additionalFields;
      })
      .addCase(getProductRecommendations.rejected, (state, action) => {
        state.error = action.payload ? action.payload : null;
        state.isLoading = false;
      })
      .addCase(getProductRecommendations.fulfilled, (state, action) => {
        state.error = null;
        state.searchUid = action.payload.searchUid;
        state.recommendations = action.payload.recommendations;
        state.isLoading = false;
      })
      .addCase(getProductRecommendations.pending, (state) => {
        state.isLoading = true;
      });
  }
);
