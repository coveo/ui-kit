import {createReducer} from '@reduxjs/toolkit';
import {registerQuerySetQuery, updateQuerySetQuery} from './query-set-actions';
import {selectQuerySuggestion} from '../query-suggest/query-suggest-actions';

export type QuerySetState = Record<string, string>;

export function getQuerySetInitialState(): QuerySetState {
  return {};
}

export const querySetReducer = createReducer(
  getQuerySetInitialState(),
  (builder) => {
    builder
      .addCase(registerQuerySetQuery, (state, action) => {
        const {id, query} = action.payload;

        if (id in state) {
          return;
        }

        state[id] = query;
      })
      .addCase(updateQuerySetQuery, (state, action) => {
        const {id, query} = action.payload;
        updateQuery(state, id, query);
      })
      .addCase(selectQuerySuggestion, (state, action) => {
        const {id, expression} = action.payload;
        updateQuery(state, id, expression);
      });
  }
);

const updateQuery = (state: QuerySetState, id: string, query: string) => {
  if (id in state) {
    state[id] = query;
  }
};
