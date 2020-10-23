import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from './search-actions';
import {getSearchInitialState} from './search-state';

export const searchReducer = createReducer(
  getSearchInitialState(),
  (builder) => {
    builder.addCase(executeSearch.rejected, (state, action) => {
      state.error = action.payload ? action.payload : null;
      state.isLoading = false;
    });
    builder.addCase(executeSearch.fulfilled, (state, action) => {
      state.error = null;
      state.response = action.payload.response;
      state.queryExecuted = action.payload.queryExecuted;
      state.duration = action.payload.duration;
      state.isLoading = false;
    });
    builder.addCase(executeSearch.pending, (state) => {
      state.isLoading = true;
    });
  }
);
