import {isUndefined} from '@coveo/bueno';
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
        if (!isUndefined(aq)) {
          state.aq = aq;
          state.aqWasSet = true;
        }
        if (!isUndefined(cq)) {
          state.cq = cq;
          state.cqWasSet = true;
        }
        if (!isUndefined(lq)) {
          state.lq = lq;
          state.lqWasSet = true;
        }
        if (!isUndefined(dq)) {
          state.dq = dq;
          state.dqWasSet = true;
        }
      })
      .addCase(registerAdvancedSearchQueries, (state, action) => {
        const {aq, cq, lq, dq} = action.payload;
        if (!isUndefined(aq)) {
          state.defaultFilters.aq = aq;
          if (!state.aqWasSet) {
            state.aq = aq;
          }
        }
        if (!isUndefined(cq)) {
          state.defaultFilters.cq = cq;
          if (!state.cqWasSet) {
            state.cq = cq;
          }
        }
        if (!isUndefined(lq)) {
          state.defaultFilters.lq = lq;
          if (!state.lqWasSet) {
            state.lq = lq;
          }
        }
        if (!isUndefined(dq)) {
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
        if (!isUndefined(aq)) {
          state.aq = aq;
          state.aqWasSet = true;
        }
        if (!isUndefined(cq)) {
          state.cq = cq;
          state.cqWasSet = true;
        }
      });
  }
);
