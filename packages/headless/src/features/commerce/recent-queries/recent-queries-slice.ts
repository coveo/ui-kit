import {createReducer} from '@reduxjs/toolkit';
import {
  handleClearRecentQueries,
  handleExecuteSearchFulfilled,
  handleRegisterQueries,
} from '../../recent-queries/recent-queries-slice';
import {getRecentQueriesInitialState} from '../../recent-queries/recent-queries-state';
import {executeSearch as commerceExecuteSearch} from '../search/search-actions';
import {
  clearRecentQueries,
  registerRecentQueries,
} from './recent-queries-actions';

export const recentQueriesReducer = createReducer(
  getRecentQueriesInitialState(),
  (builder) => {
    builder
      .addCase(registerRecentQueries, handleRegisterQueries)
      .addCase(clearRecentQueries, handleClearRecentQueries)
      .addCase(commerceExecuteSearch.fulfilled, (state, action) => {
        const query = action.payload.queryExecuted?.trim() || '';
        const products = action.payload.response.products;
        if (!query.length || !products.length) {
          return;
        }
        handleExecuteSearchFulfilled(query, state);
      });
  }
);
