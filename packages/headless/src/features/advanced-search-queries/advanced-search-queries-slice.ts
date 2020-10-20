import {createReducer} from '@reduxjs/toolkit';
import {change} from '../history/history-actions';
import {updateAdvancedSearchQueries} from './advanced-search-queries-actions';
import {isUndefined} from '@coveo/bueno';

export interface AdvancedSearchQueriesState {
  /**
   * The cq filter (e.g., `((q AND aq) OR dq) AND cq).
   */
  cq: string;

  /**
   * The aq filter (e.g., `((q AND aq) OR dq) AND cq).
   */
  aq: string;
}

export const getAdvancedSearchQueriesInitialState: () => AdvancedSearchQueriesState = () => ({
  cq: '',
  aq: '',
});

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
