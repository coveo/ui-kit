import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions';
import {updateAdvancedSearchQueries} from './advanced-search-queries-actions';
import {isUndefined} from '@coveo/bueno';
import {getAdvancedSearchQueriesInitialState} from './advanced-search-queries-state';

export const advancedSearchQueriesReducer = createReducer(
  getAdvancedSearchQueriesInitialState(),
  (builder) => {
    builder
      .addCase(updateAdvancedSearchQueries, (state, action) => {
        if (!isUndefined(action.payload.aq)) {
          state.aq = action.payload.aq!;
        }
        if (!isUndefined(action.payload.cq)) {
          state.cq = action.payload.cq!;
        }
      })
      .addCase(
        change.fulfilled,
        (_, action) => action.payload.advancedSearchQueries
      );
  }
);
