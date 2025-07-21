import {createReducer, type Draft as WritableDraft} from '@reduxjs/toolkit';
import type {registerRecentQueries as registerCommerceRecentQueries} from '../commerce/recent-queries/recent-queries-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {
  clearRecentQueries,
  registerRecentQueries,
} from './recent-queries-actions.js';
import {
  getRecentQueriesInitialState,
  type RecentQueriesState,
} from './recent-queries-state.js';

export const recentQueriesReducer = createReducer(
  getRecentQueriesInitialState(),
  (builder) => {
    builder
      .addCase(registerRecentQueries, handleRegisterQueries)
      .addCase(clearRecentQueries, handleClearRecentQueries)
      .addCase(executeSearch.fulfilled, (state, action) => {
        const query = action.payload.queryExecuted;
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
  action:
    | ReturnType<typeof registerRecentQueries>
    | ReturnType<typeof registerCommerceRecentQueries>
) {
  state.queries = Array.from(
    new Set(action.payload.queries.map((query) => query.trim().toLowerCase()))
  ).slice(0, action.payload.maxLength);
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
  const cleanNewQuery = query.trim().toLowerCase();
  if (cleanNewQuery === '') {
    return;
  }

  const previousQueries = Array.from(
    new Set(
      state.queries.filter(
        (query) => query.trim().toLowerCase() !== cleanNewQuery
      )
    )
  ).slice(0, state.maxLength - 1);

  state.queries = [cleanNewQuery, ...previousQueries];
}
