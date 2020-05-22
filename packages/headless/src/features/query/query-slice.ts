import {createReducer} from '@reduxjs/toolkit';
import {QueryState} from '../../state';
import {updateQuery} from './query-actions';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';

export const getQueryInitialState: () => QueryState = () => ({
  q: '',
});

export const queryReducer = createReducer(getQueryInitialState(), (builder) =>
  builder
    .addCase(updateQuery, (state, action) => {
      state.q = action.payload.q;
    })
    .addCase(selectQuerySuggestion, (state, action) => {
      state.q = action.payload.expression;
    })
);
