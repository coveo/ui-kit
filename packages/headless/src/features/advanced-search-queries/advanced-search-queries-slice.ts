import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions';
import {
  registerAdvancedSearchQueries,
  updateAdvancedSearchQueries,
} from './advanced-search-queries-actions';
import {isUndefined} from '@coveo/bueno';
import {getAdvancedSearchQueriesInitialState} from './advanced-search-queries-state';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';

export const advancedSearchQueriesReducer = createReducer(
  getAdvancedSearchQueriesInitialState(),
  (builder) => {
    builder
      .addCase(updateAdvancedSearchQueries, (state, action) => {
        const {aq, cq} = action.payload;
        if (!isUndefined(aq)) {
          state.aq = aq;
          state.aqWasSet = true;
        }
        if (!isUndefined(cq)) {
          state.cq = cq;
          state.cqWasSet = true;
        }
      })
      .addCase(registerAdvancedSearchQueries, (state, action) => {
        const {aq, cq} = action.payload;
        if (!isUndefined(aq) && !state.aqWasSet) {
          state.aq = aq;
        }
        if (!isUndefined(cq) && !state.cqWasSet) {
          state.cq = cq;
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
