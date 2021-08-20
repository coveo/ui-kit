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
        state.results = action.payload.results;
        state.maxLength = action.payload.maxLength;
      })
      .addCase(clearRecentResults, (state) => {
        state.results.length = 0;
      })
      .addCase(pushRecentResult, (state, action) => {
        const result = action.payload;
        if (state.results.some((r) => r.uniqueId === result.uniqueId)) {
          return;
        }
        state.results.unshift(result);
        if (state.results.length > state.maxLength) {
          state.results.pop();
        }
      });
  }
);
