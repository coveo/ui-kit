import {createReducer} from '@reduxjs/toolkit';
import {
  clearRecentResults,
  pushRecentResult,
  registerRecentResults,
} from './recent-results-actions.js';
import {getRecentResultsInitialState} from './recent-results-state.js';

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
        const remaining = state.results.slice(0, state.maxLength - 1);
        state.results = [result, ...remaining];
      });
  }
);
