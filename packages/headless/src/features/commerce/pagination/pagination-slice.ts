import {Reducer, createReducer} from '@reduxjs/toolkit';
import {fetchProductListing} from '../product-listing/product-listing-actions.js';
import {nextPage, previousPage, selectPage} from './pagination-actions.js';
import {CommercePaginationState, getCommercePaginationInitialState} from './pagination-state.js';

export const paginationReducer: Reducer<CommercePaginationState> = createReducer(
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
        const responsePagination = action.payload.response.pagination;
        state.perPage = responsePagination.perPage;
        state.totalCount = responsePagination.totalCount;
        state.totalPages = responsePagination.totalPages;
        // TODO: replace with state = responsePagination once the API response pagination returns the current page.
      });
  }
);
