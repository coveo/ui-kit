import {AnyAction, type Draft as WritableDraft} from '@reduxjs/toolkit';
import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions.js';
import {
  registerRecentQueries,
  clearRecentQueries,
} from './recent-queries-actions.js';
import {
  RecentQueriesState,
  getRecentQueriesInitialState,
} from './recent-queries-state.js';

export const recentQueriesReducer = createReducer(
  getRecentQueriesInitialState(),
  (builder) => {
    builder
      .addCase(registerRecentQueries, handleRegisterQueries)
      .addCase(clearRecentQueries, handleClearRecentQueries)
      .addCase(executeSearch.fulfilled, (state, action) => {
        const query = action.payload.queryExecuted.trim();
        const results = action.payload.response.results;
        if (!query.length || !results.length) {
          return;
        }
        handleExecuteSearchFulfilled(query, state);
      });
  }
);

export function handleRegisterQueries(
  state: WritableDraft<RecentQueriesState>,
  action: AnyAction
) {
  state.queries = action.payload.queries.slice(0, action.payload.maxLength);
  state.maxLength = action.payload.maxLength;
}

export function handleClearRecentQueries(
  state: WritableDraft<RecentQueriesState>
) {
  state.queries = [];
}

export function handleExecuteSearchFulfilled(
  query: string,
  state: WritableDraft<RecentQueriesState>
) {
  state.queries = state.queries.filter((q) => q !== query);
  const remaining = state.queries.slice(0, state.maxLength - 1);
  state.queries = [query, ...remaining];
}
