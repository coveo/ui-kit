import {createReducer} from '@reduxjs/toolkit';
import {
  registerRecentQueries,
  clearRecentQueries,
} from './recent-queries-actions';
import {executeSearch} from '../search/search-actions';
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
        const query = action.payload.queryExecuted;
        if (!query.length || state.queries.includes(query)) {
          return;
        }
        state.queries.unshift(query);
        if (state.queries.length > state.maxLength) {
          state.queries.pop();
        }
      });
  }
);
