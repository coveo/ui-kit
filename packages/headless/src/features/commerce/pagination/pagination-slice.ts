import {createReducer} from '@reduxjs/toolkit';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../facets/facet-set/facet-set-actions';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {defaultSolutionTypeId} from '../common/actions';
import {setContext, setUser, setView} from '../context/context-actions';
import {fetchProductListing} from '../product-listing/product-listing-actions';
import {executeSearch} from '../search/search-actions';
import {
  nextPage,
  previousPage,
  selectPage,
  setPageSize,
} from './pagination-actions';
import {
  CommercePaginationState,
  getCommercePaginationInitialState,
} from './pagination-state';

export const paginationReducer = createReducer(
  getCommercePaginationInitialState(),
  (builder) => {
    builder
      .addCase(nextPage, (state, action) => {
        const slice = state[action.payload.solutionTypeId];

        if (!slice) {
          return;
        }

        if (slice.page < slice.totalPages - 1) {
          ++slice.page;
        }
      })
      .addCase(previousPage, (state, action) => {
        const slice = state[action.payload.solutionTypeId];

        if (!slice) {
          return;
        }

        if (slice.page > 0) {
          --slice.page;
        }
      })
      .addCase(selectPage, (state, action) => {
        const slice = state[action.payload.solutionTypeId];

        if (!slice) {
          return;
        }

        if (
          action.payload.page >= 0 &&
          action.payload.page < slice.totalPages
        ) {
          slice.page = action.payload.page;
        }
      })
      .addCase(setPageSize, (state, action) => {
        const slice = state[action.payload.solutionTypeId];

        if (!slice) {
          return;
        }

        slice.perPage = action.payload.pageSize;
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        // TODO: Revisit this
        if (!state[defaultSolutionTypeId]) {
          return;
        }

        state[defaultSolutionTypeId] = action.payload.response.pagination;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        if (!state[defaultSolutionTypeId]) {
          return;
        }

        state[defaultSolutionTypeId] = action.payload.response.pagination;
      })
      .addCase(deselectAllFacetValues, handlePaginationReset)
      .addCase(toggleSelectFacetValue, handlePaginationReset)
      .addCase(toggleExcludeFacetValue, handlePaginationReset)
      .addCase(toggleSelectNumericFacetValue, handlePaginationReset)
      .addCase(toggleExcludeNumericFacetValue, handlePaginationReset)
      .addCase(setContext, handlePaginationReset)
      .addCase(setView, handlePaginationReset)
      .addCase(setUser, handlePaginationReset);
  }
);

function handlePaginationReset(state: CommercePaginationState) {
  for (const solutionTypeId in state) {
    if (state[solutionTypeId]) {
      state[solutionTypeId]!.page = 0;
      state[solutionTypeId]!.perPage = undefined;
    }
  }
}
