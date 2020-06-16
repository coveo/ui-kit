import {createReducer} from '@reduxjs/toolkit';
import {
  registerNumberOfResults,
  updateNumberOfResults,
  updatePage,
  registerPage,
} from './pagination-actions';

export type PaginationState = {
  firstResult: number;
  numberOfResults: number;
};

export function getPaginationInitialState(): PaginationState {
  return {
    firstResult: 0,
    numberOfResults: 10,
  };
}

export const maximumNumberOfResultsFromIndex = 1000;

export const paginationReducer = createReducer(
  getPaginationInitialState(),
  (builder) => {
    builder
      .addCase(registerNumberOfResults, (state, action) => {
        const page = calculatePage(state.firstResult, state.numberOfResults);
        const newNumberOfResults = action.payload;

        state.numberOfResults = newNumberOfResults;
        state.firstResult = calculateFirstResult(page, newNumberOfResults);
      })
      .addCase(updateNumberOfResults, (state, action) => {
        state.numberOfResults = action.payload;
        state.firstResult = 0;
      })
      .addCase(registerPage, (state, action) => {
        const page = action.payload;
        state.firstResult = calculateFirstResult(page, state.numberOfResults);
      })
      .addCase(updatePage, (state, action) => {
        const page = action.payload;
        state.firstResult = calculateFirstResult(page, state.numberOfResults);
      });
  }
);

export function calculateFirstResult(page: number, numberOfResults: number) {
  return (page - 1) * numberOfResults;
}

export function calculatePage(firstResult: number, numberOfResults: number) {
  return firstResult / numberOfResults + 1;
}
