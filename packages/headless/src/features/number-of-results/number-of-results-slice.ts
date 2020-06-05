import {createReducer} from '@reduxjs/toolkit';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from './number-of-results-actions';

export type NumberOfResultsState = number;

export function getNumberOfResultsInitialState(): NumberOfResultsState {
  return -1;
}

export const numberOfResultsReducer = createReducer(
  getNumberOfResultsInitialState(),
  (builder) => {
    builder
      .addCase(registerNumberOfResults, (state, action) => {
        const wasInitialized = state !== getNumberOfResultsInitialState();
        return wasInitialized ? state : action.payload;
      })
      .addCase(updateNumberOfResults, (_, action) => action.payload);
  }
);
