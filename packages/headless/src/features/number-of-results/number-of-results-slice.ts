import {createReducer} from '@reduxjs/toolkit';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from './number-of-results-actions';

export type NumberOfResultsState = number;

export function getNumberOfResultsInitialState(): NumberOfResultsState {
  return 10;
}

export const numberOfResultsReducer = createReducer(
  getNumberOfResultsInitialState(),
  (builder) => {
    builder
      .addCase(registerNumberOfResults, (_, action) => action.payload)
      .addCase(updateNumberOfResults, (_, action) => action.payload);
  }
);
