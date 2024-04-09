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
      .addCase(nextPage, (state) => {
        if (state.page < state.totalPages - 1) {
          ++state.page;
        }
      })
      .addCase(previousPage, (state) => {
        if (state.page > 0) {
          --state.page;
        }
      })
      .addCase(selectPage, (state, action) => {
        if (action.payload >= 0 && action.payload < state.totalPages) {
          state.page = action.payload;
        }
      })
      .addCase(setPageSize, (state, action) => {
        state.perPage = action.payload;
      })
      .addCase(
        fetchProductListing.fulfilled,
        (_, action) => action.payload.response.pagination
      )
      .addCase(
        executeSearch.fulfilled,
        (_, action) => action.payload.response.pagination
      )
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
  state.page = 0;
  state.perPage = 0;
}
