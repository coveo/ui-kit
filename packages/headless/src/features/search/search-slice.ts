import {createReducer} from '@reduxjs/toolkit';
import {executeSearch, fetchMoreResults} from './search-actions';
import {getSearchInitialState} from './search-state';

const searchActions = [executeSearch, fetchMoreResults];

export const searchReducer = createReducer(
  getSearchInitialState(),
  (builder) => {
    searchActions.forEach((searchAction) => {
      builder.addCase(searchAction.rejected, (state, action) => {
        state.error = action.payload ? action.payload : null;
        state.isLoading = false;
      });
      builder.addCase(searchAction.fulfilled, (state, action) => {
        state.error = null;
        state.results =
          searchAction === fetchMoreResults
            ? [...state.results, ...action.payload.response.results]
            : action.payload.response.results;
        state.response = action.payload.response;
        state.queryExecuted = action.payload.queryExecuted;
        state.duration = action.payload.duration;
        state.isLoading = false;
        if (searchAction === executeSearch) {
          state.lastRequest = action.payload.requestExecuted;
        }
      });
      builder.addCase(searchAction.pending, (state) => {
        state.isLoading = true;
      });
    });
  }
);
