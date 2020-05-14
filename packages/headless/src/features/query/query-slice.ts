import {createAction, createReducer} from '@reduxjs/toolkit';
import {QueryState} from '../../state';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-slice';

export const updateQuery = createAction<{q: string}>('query/updateQuery');

export const getQueryInitialState: () => QueryState = () => ({
  q: 'hello',
});

export const queryReducer = createReducer(getQueryInitialState(), builder =>
  builder
    .addCase(updateQuery, (state, action) => {
      state.q = action.payload.q;
    })
    .addCase(selectQuerySuggestion, (state, action) => {
      state.q = action.payload.expression;
    })
);
