import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {
  registerRecentQueries,
  clearRecentQueries,
} from './recent-queries-actions';
import {getRecentQueriesInitialState} from './recent-queries-state';

export const recentQueriesReducer = createReducer(
  getRecentQueriesInitialState(),
  (builder) => {
    builder
      .addCase(registerRecentQueries, (state, action) => {
        state.queries = action.payload.queries.slice(
          0,
          action.payload.maxLength
        );
        state.maxLength = action.payload.maxLength;
      })
      .addCase(clearRecentQueries, (state) => {
        state.queries = [];
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const query = action.payload.queryExecuted.trim();
        const results = action.payload.response.results;
        if (!query.length || !results.length) {
          return;
        }
        state.queries = state.queries.filter((q) => q !== query);
        const remaining = state.queries.slice(0, state.maxLength - 1);
        state.queries = [query, ...remaining];
      });
  }
);
