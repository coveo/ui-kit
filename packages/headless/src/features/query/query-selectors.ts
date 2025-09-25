import {createSelector} from '@reduxjs/toolkit';
import type {QueryState} from './query-state.js';

export const selectQuery = createSelector(
  (state: {query?: QueryState}) => state.query,
  (query) => query
);

export const selectEnableQuerySyntax = createSelector(
  (state: {query?: QueryState}) => state.query?.enableQuerySyntax,
  (enableQuerySyntax) => enableQuerySyntax
);
