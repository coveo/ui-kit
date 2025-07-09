import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../breadcrumb/breadcrumb-actions.js';
import {toggleSelectAutomaticFacetValue} from '../facets/automatic-facet-set/automatic-facet-set-actions.js';
import {
  deselectAllCategoryFacetValues,
  toggleSelectCategoryFacetValue,
} from '../facets/category-facet-set/category-facet-set-actions.js';
import {selectCategoryFacetSearchResult} from '../facets/facet-search-set/category/category-facet-search-actions.js';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../facets/facet-search-set/specific/specific-facet-search-actions.js';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from './../facets/facet-set/facet-set-actions.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
  updateDateFacetValues,
} from '../facets/range-facets/date-facet-set/date-facet-actions.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateNumericFacetValues,
} from '../facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {change} from '../history/history-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {updateActiveTab} from '../tab-set/tab-set-actions.js';
import {
  nextPage,
  previousPage,
  registerNumberOfResults,
  registerPage,
  updateNumberOfResults,
  updatePage,
} from './pagination-actions.js';
import {
  maximumNumberOfResultsFromIndex,
  minimumPage,
} from './pagination-constants.js';
import {
  getPaginationInitialState,
  type PaginationState,
} from './pagination-state.js';

export const paginationReducer = createReducer(
  getPaginationInitialState(),
  (builder) => {
    builder
      .addCase(registerNumberOfResults, (state, action) => {
        const page = determineCurrentPage(state);
        const newNumberOfResults = action.payload;

        state.defaultNumberOfResults = state.numberOfResults =
          newNumberOfResults;
        state.firstResult = calculateFirstResult(page, newNumberOfResults);
      })
      .addCase(updateNumberOfResults, (state, action) => {
        state.numberOfResults = action.payload;
        state.firstResult = 0;
      })
      .addCase(updateActiveTab, (state) => {
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
          action.payload.numberOfResults ?? state.defaultNumberOfResults;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const {response} = action.payload;
        state.totalCountFiltered = response.totalCountFiltered;
      })
      .addCase(deselectAllFacetValues, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleExcludeDateFacetValue, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleExcludeFacetValue, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleExcludeNumericFacetValue, (state) => {
        handlePaginationReset(state);
      })
      .addCase(excludeFacetSearchResult, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleSelectFacetValue, (state) => {
        handlePaginationReset(state);
      })
      .addCase(deselectAllCategoryFacetValues, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleSelectCategoryFacetValue, (state) => {
        handlePaginationReset(state);
      })
      .addCase(selectCategoryFacetSearchResult, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleSelectDateFacetValue, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleSelectNumericFacetValue, (state) => {
        handlePaginationReset(state);
      })
      .addCase(deselectAllBreadcrumbs, (state) => {
        handlePaginationReset(state);
      })
      .addCase(updateDateFacetValues, (state) => {
        handlePaginationReset(state);
      })
      .addCase(updateNumericFacetValues, (state) => {
        handlePaginationReset(state);
      })
      .addCase(selectFacetSearchResult, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleSelectAutomaticFacetValue, (state) => {
        handlePaginationReset(state);
      });
  }
);

function handlePaginationReset(state: PaginationState) {
  state.firstResult = getPaginationInitialState().firstResult;
}

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
  return Math.round(firstResult / numberOfResults) + 1;
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
