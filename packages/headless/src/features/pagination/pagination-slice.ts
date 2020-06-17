import {createReducer} from '@reduxjs/toolkit';
import {
  registerNumberOfResults,
  updateNumberOfResults,
  updatePage,
  registerPage,
  previousPage,
  nextPage,
} from './pagination-actions';
import {executeSearch} from '../search/search-actions';

export type PaginationState = {
  firstResult: number;
  numberOfResults: number;
  totalCountFiltered: number;
};

export function getPaginationInitialState(): PaginationState {
  return {
    firstResult: 0,
    numberOfResults: 10,
    totalCountFiltered: 0,
  };
}

export const minimumPage = 1;
export const maximumNumberOfResultsFromIndex = 1000;

export const paginationReducer = createReducer(
  getPaginationInitialState(),
  (builder) => {
    builder
      .addCase(registerNumberOfResults, (state, action) => {
        const page = determineCurrentPage(state);
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
      })
      .addCase(previousPage, (state) => {
        const page = determineCurrentPage(state);
        const previousPage = Math.max(page - 1, minimumPage);
        state.firstResult = calculateFirstResult(
          previousPage,
          state.numberOfResults
        );
      })
      .addCase(nextPage, (state) => {
        const page = determineCurrentPage(state);
        const maxPage = determineMaxPage(state);
        const nextPage = Math.min(page + 1, maxPage);

        state.firstResult = calculateFirstResult(
          nextPage,
          state.numberOfResults
        );
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const {response} = action.payload;
        state.totalCountFiltered = response.totalCountFiltered;
      });
  }
);

function determineCurrentPage(state: PaginationState) {
  const {firstResult, numberOfResults} = state;
  return calculatePage(firstResult, numberOfResults);
}

function determineMaxPage(state: PaginationState) {
  const {totalCountFiltered, numberOfResults} = state;
  return calculateMaxPage(totalCountFiltered, numberOfResults);
}

export function calculateFirstResult(page: number, numberOfResults: number) {
  return (page - 1) * numberOfResults;
}

export function calculatePage(firstResult: number, numberOfResults: number) {
  return firstResult / numberOfResults + 1;
}

export function calculateMaxPage(
  totalCountFiltered: number,
  numberOfResults: number
) {
  const totalCount = Math.min(
    totalCountFiltered,
    maximumNumberOfResultsFromIndex
  );
  return Math.ceil(totalCount / numberOfResults);
}
