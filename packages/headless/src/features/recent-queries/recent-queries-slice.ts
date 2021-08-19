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
        state.queries = action.payload.queries;
        state.maxQueries = action.payload.maxQueries;
      })
      .addCase(clearRecentQueries, (state) => {
        state.queries.length = 0;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const query = action.payload.queryExecuted;
        if (state.queries.includes(query)) {
          return;
        }
        state.queries.unshift(query);
        if (state.queries.length > state.maxQueries) {
          state.queries.pop();
        }
      });
  }
);
