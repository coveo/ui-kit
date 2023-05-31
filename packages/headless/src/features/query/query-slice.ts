import {createReducer} from '@reduxjs/toolkit';
import {applyDidYouMeanCorrection} from '../did-you-mean/did-you-mean-actions';
import {change} from '../history/history-actions';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {updateQuery} from './query-actions';
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
