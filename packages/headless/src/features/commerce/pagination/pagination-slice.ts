import {createReducer} from '@reduxjs/toolkit';
import {fetchProductListing} from '../product-listing/product-listing-actions';
import {executeSearch} from '../search/search-actions';
import {nextPage, previousPage, selectPage} from './pagination-actions';
import {getCommercePaginationInitialState} from './pagination-state';

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
      .addCase(
        fetchProductListing.fulfilled,
        (_, action) => action.payload.response.pagination
      )
      .addCase(
        executeSearch.fulfilled,
        (_, action) => action.payload.response.pagination
      );
  }
);
