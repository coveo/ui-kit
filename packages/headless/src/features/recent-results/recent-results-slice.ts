import {createReducer} from '@reduxjs/toolkit';
import {
  registerRecentResults,
  clearRecentResults,
  pushRecentResult,
} from './recent-results-actions';
import {getRecentResultsInitialState} from './recent-results-state';

export const recentResultsReducer = createReducer(
  getRecentResultsInitialState(),
  (builder) => {
    builder
      .addCase(registerRecentResults, (state, action) => {
        state.results = action.payload.results.slice(
          0,
          action.payload.maxLength
        );
        state.maxLength = action.payload.maxLength;
      })
      .addCase(clearRecentResults, (state) => {
        state.results = [];
      })
      .addCase(pushRecentResult, (state, action) => {
        const result = action.payload;
        state.results = state.results.filter(
          (r) => r.uniqueId !== result.uniqueId
        );
        state.results.unshift(result);
        if (state.results.length > state.maxLength) {
          state.results.pop();
        }
      });
  }
);
