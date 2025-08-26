import {createReducer} from '@reduxjs/toolkit';
import {setError} from '../error/error-actions.js';
import {
  getRecommendations,
  setRecommendationId,
} from './recommendation-actions.js';
import {getRecommendationInitialState} from './recommendation-state.js';

export const recommendationReducer = createReducer(
  getRecommendationInitialState(),

  (builder) => {
    builder
      .addCase(setRecommendationId, (state, action) => {
        state.id = action.payload.id;
      })
      .addCase(getRecommendations.rejected, (state, action) => {
        state.error = action.payload ? action.payload : null;
        state.isLoading = false;
      })
      .addCase(getRecommendations.fulfilled, (state, action) => {
        state.error = null;
        state.recommendations = action.payload.recommendations.map(
          (recommendation) => ({
            ...recommendation,
            searchUid: action.payload.searchUid,
          })
        );
        state.duration = action.payload.duration;
        state.isLoading = false;
        state.searchUid = action.payload.searchUid;
        state.splitTestRun = action.payload.splitTestRun;
        state.pipeline = action.payload.pipeline;
      })
      .addCase(getRecommendations.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(setError, (state, action) => {
        state.error = action.payload;
        state.isLoading = false;
      });
  }
);
