import {createAction, createReducer} from '@reduxjs/toolkit';

export const updateQueryExpression = createAction<{expression: string}>(
  'query/updateExpression'
);

export interface QueryState {
  expression: string;
}

const initialState: QueryState = {
  expression: '',
};

export const queryReducer = createReducer(initialState, builder =>
  builder.addCase(updateQueryExpression, (state, action) => {
    state.expression = action.payload.expression;
  })
);
