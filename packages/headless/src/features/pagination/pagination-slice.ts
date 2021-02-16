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
import {change} from '../history/history-actions';
import {getPaginationInitialState, PaginationState} from './pagination-state';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';

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
      .addCase(change.fulfilled, (state, action) => {
        if (action.payload) {
          state.numberOfResults = action.payload.pagination.numberOfResults;
          state.firstResult = action.payload.pagination.firstResult;
        }
      })
      .addCase(restoreSearchParameters, (state, action) => {
        state.firstResult = action.payload.firstResult ?? state.firstResult;
        state.numberOfResults =
          action.payload.numberOfResults ?? state.numberOfResults;
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
