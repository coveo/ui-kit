import {createSelector} from '@reduxjs/toolkit';
import type {AdvancedSearchQueriesState} from './advanced-search-queries-state.js';

export const selectAdvancedSearchQueries = createSelector(
  (state: {advancedSearchQueries?: AdvancedSearchQueriesState}) =>
    state.advancedSearchQueries,
  (advancedSearchQueries) => {
    if (!advancedSearchQueries) {
      return {};
    }
    const {aq, cq, dq, lq} = advancedSearchQueries;
    return {
      ...(aq && {aq}),
      ...(cq && {cq}),
      ...(dq && {dq}),
      ...(lq && {lq}),
    };
  }
);
