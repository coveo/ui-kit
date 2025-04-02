import {createReducer} from '@reduxjs/toolkit';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions.js';
import {change} from '../history/history-actions.js';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {updateQuery} from './query-actions.js';
import {getQueryInitialState} from './query-state.js';

export const queryReducer = createReducer(getQueryInitialState(), (builder) =>
  builder
    .addCase(updateQuery, (state, action) => ({...state, ...action.payload}))
    .addCase(applyDidYouMeanCorrection, (state, action) => {
      state.q = action.payload;
    })
    .addCase(selectQuerySuggestion, (state, action) => {
      state.q = action.payload.expression;
    })
    .addCase(
      change.fulfilled,
      (state, action) => action.payload?.query ?? state
    )
    .addCase(restoreSearchParameters, (state, action) => {
      state.q = action.payload.q ?? state.q;
      state.enableQuerySyntax =
        action.payload.enableQuerySyntax ?? state.enableQuerySyntax;
    })
);
