import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {
  registerAdvancedSearchQueries,
  updateAdvancedSearchQueries,
} from './advanced-search-queries-actions.js';
import {getAdvancedSearchQueriesInitialState} from './advanced-search-queries-state.js';

export const advancedSearchQueriesReducer = createReducer(
  getAdvancedSearchQueriesInitialState(),
  (builder) => {
    builder
      .addCase(updateAdvancedSearchQueries, (state, action) => {
        const {aq, cq, lq, dq} = action.payload;
        if (aq !== undefined) {
          state.aq = aq;
          state.aqWasSet = true;
        }
        if (cq !== undefined) {
          state.cq = cq;
          state.cqWasSet = true;
        }
        if (lq !== undefined) {
          state.lq = lq;
          state.lqWasSet = true;
        }
        if (dq !== undefined) {
          state.dq = dq;
          state.dqWasSet = true;
        }
      })
      .addCase(registerAdvancedSearchQueries, (state, action) => {
        const {aq, cq, lq, dq} = action.payload;
        if (aq !== undefined) {
          state.defaultFilters.aq = aq;
          if (!state.aqWasSet) {
            state.aq = aq;
          }
        }
        if (cq !== undefined) {
          state.defaultFilters.cq = cq;
          if (!state.cqWasSet) {
            state.cq = cq;
          }
        }
        if (lq !== undefined) {
          state.defaultFilters.lq = lq;
          if (!state.lqWasSet) {
            state.lq = lq;
          }
        }
        if (dq !== undefined) {
          state.defaultFilters.dq = dq;
          if (!state.dqWasSet) {
            state.dq = dq;
          }
        }
      })
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.advancedSearchQueries ?? state
      )
      .addCase(restoreSearchParameters, (state, action) => {
        const {aq, cq} = action.payload;
        if (aq !== undefined) {
          state.aq = aq;
          state.aqWasSet = true;
        }
        if (cq !== undefined) {
          state.cq = cq;
          state.cqWasSet = true;
        }
      });
  }
);
