import {createAction, createReducer} from '@reduxjs/toolkit';

export const updateQuery = createAction<{q: string}>('query/updateQuery');

export interface QueryState {
  q: string;
}

export const getQueryInitialState: () => QueryState = () => ({
  q: '',
});

export const queryReducer = createReducer(getQueryInitialState(), builder =>
  builder.addCase(updateQuery, (state, action) => {
    state.q = action.payload.q;
  })
);
