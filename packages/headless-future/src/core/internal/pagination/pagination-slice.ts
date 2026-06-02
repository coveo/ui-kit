import {createSlice} from '@reduxjs/toolkit';
import type {PaginationState} from '@/src/core/interface/pagination/pagination-types.js';
import * as PaginationActions from './pagination-actions.js';

export const initialPaginationState: PaginationState = {
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
};

export const paginationSlice = createSlice({
  name: 'pagination',
  initialState: initialPaginationState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(PaginationActions.setPage, (state, action) => {
      state.currentPage = action.payload;
    });
    builder.addCase(PaginationActions.setPageSize, (state, action) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    });
    builder.addCase(PaginationActions.setTotalCount, (state, action) => {
      state.totalCount = action.payload;
    });
    builder.addCase(PaginationActions.nextPage, (state) => {
      const totalPages = Math.ceil(state.totalCount / state.pageSize);
      if (state.currentPage < totalPages) {
        state.currentPage += 1;
      }
    });
    builder.addCase(PaginationActions.previousPage, (state) => {
      if (state.currentPage > 1) {
        state.currentPage -= 1;
      }
    });
    builder.addCase(PaginationActions.resetToFirstPage, (state) => {
      state.currentPage = 1;
    });
  },
  selectors: {
    currentPage: (state) => state.currentPage,
    pageSize: (state) => state.pageSize,
    totalCount: (state) => state.totalCount,
    totalPages: (state) => Math.ceil(state.totalCount / state.pageSize),
    isFirstPage: (state) => state.currentPage === 1,
    isLastPage: (state) => {
      const totalPages = Math.ceil(state.totalCount / state.pageSize);
      return state.currentPage === totalPages;
    },
  },
});
