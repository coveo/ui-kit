import {createSelector} from '@reduxjs/toolkit';
import type {QueryState} from './query-state.js';

export const selectQuery = createSelector(
  (state: {query?: QueryState}) => state.query,
  (query) => query
);
