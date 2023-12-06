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
import {fetchProductListing} from '../product-listing/product-listing-actions';
import {nextPage, previousPage, selectPage} from './pagination-actions';
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
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        const {page, perPage, totalCount, totalPages} =
          action.payload.response.pagination;
        state.page = page;
        state.perPage = perPage;
        state.totalCount = totalCount;
        state.totalPages = totalPages;
      })
      .addCase(deselectAllFacetValues, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleSelectFacetValue, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleExcludeFacetValue, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleSelectNumericFacetValue, (state) => {
        handlePaginationReset(state);
      })
      .addCase(toggleExcludeNumericFacetValue, (state) => {
        handlePaginationReset(state);
      });
  }
);

function handlePaginationReset(state: CommercePaginationState) {
  state.page = 0;
}
