import {createReducer} from '@reduxjs/toolkit';
import {updateQuery} from './query-actions';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';
import {change} from '../history/history-actions';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {getQueryInitialState} from './query-state';

export const queryReducer = createReducer(getQueryInitialState(), (builder) =>
  builder
    .addCase(updateQuery, (state, action) => ({...state, ...action.payload}))
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
