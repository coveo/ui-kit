import {createAction, createReducer} from '@reduxjs/toolkit';
import {QueryState} from '../../state';

export const updateQuery = createAction<{q: string}>('query/updateQuery');

export const getQueryInitialState: () => QueryState = () => ({
  q: '',
});

export const queryReducer = createReducer(getQueryInitialState(), builder =>
  builder.addCase(updateQuery, (state, action) => {
    state.q = action.payload.q;
  })
);
