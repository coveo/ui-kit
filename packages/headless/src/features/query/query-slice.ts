import {createReducer} from '@reduxjs/toolkit';
import {updateQuery} from './query-actions';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';
import {change} from '../history/history-actions';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';

export interface QueryState {
  /**
   * The basic query expression (e.g., `acme tornado seeds`).
   */
  q: string;
}

export const getQueryInitialState: () => QueryState = () => ({
  q: '',
});

export const queryReducer = createReducer(getQueryInitialState(), (builder) =>
  builder
    .addCase(updateQuery, (state, action) => {
      state.q = action.payload.q;
    })
    .addCase(applyDidYouMeanCorrection, (state, action) => {
      state.q = action.payload;
    })
    .addCase(selectQuerySuggestion, (state, action) => {
      state.q = action.payload.expression;
    })
    .addCase(change.fulfilled, (state, action) => {
      state.q = action.payload.query.q;
    })
);
