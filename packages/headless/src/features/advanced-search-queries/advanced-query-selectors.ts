import {createSelector} from '@reduxjs/toolkit';
import {AdvancedSearchQueriesState} from './advanced-search-queries-state.js';

export const selectAdvancedSearchQueries = createSelector(
  (state: {advancedSearchQueries?: AdvancedSearchQueriesState}) =>
    state.advancedSearchQueries,
  (advancedSearchQueries) => advancedSearchQueries
);
