import {createReducer} from '@reduxjs/toolkit';
import {
  SearchState,
  SearchResponse,
} from '../../api/search/search/search-response';
import {executeSearch} from './search-actions';

export function getSearchInitialState(): SearchState {
  return {
    response: {
      results: [],
    },
  };
}

export const searchReducer = createReducer(
  getSearchInitialState(),
  (builder) => {
    builder.addCase(executeSearch.fulfilled, (state, action) => {
      state.response = action.payload;
    });
  }
);
