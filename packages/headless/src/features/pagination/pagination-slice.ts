import {createReducer} from '@reduxjs/toolkit';
import {
  registerNumberOfResults,
  updateNumberOfResults,
} from './pagination-actions';

export type PaginationState = {
  numberOfResults: number;
};

export function getPaginationInitialState(): PaginationState {
  return {
    numberOfResults: 10,
  };
}

export const paginationReducer = createReducer(
  getPaginationInitialState(),
  (builder) => {
    builder
      .addCase(registerNumberOfResults, (state, action) => {
        state.numberOfResults = action.payload;
      })
      .addCase(updateNumberOfResults, (state, action) => {
        state.numberOfResults = action.payload;
      });
  }
);
