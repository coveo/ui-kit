import {createReducer} from '@reduxjs/toolkit';
import {
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  fetchQuerySuggestions,
  registerQuerySuggest,
  selectQuerySuggestion,
  unregisterQuerySuggest,
} from './query-suggest-actions';
import {updateQuerySetQuery} from '../query-set/query-set-actions';
import {QuerySuggestState, QuerySuggestSet} from '../../state';

export const getQuerySuggestInitialState: () => QuerySuggestState = () => ({
  id: '',
  completions: [],
  count: 5,
  q: '',
  currentRequestId: '',
  error: null,
});

export const querySuggestReducer = createReducer(
  {} as QuerySuggestSet,
  (builder) =>
    builder
      .addCase(registerQuerySuggest, (state, action) => {
        state[action.payload.id] = {
          ...getQuerySuggestInitialState(),
          ...action.payload,
        };
      })
      .addCase(unregisterQuerySuggest, (state, action) => {
        delete state[action.payload.id];
      })
      .addCase(fetchQuerySuggestions.pending, (state, action) => {
        state[action.meta.arg.id]!.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchQuerySuggestions.fulfilled, (state, action) => {
        const id = action.meta.arg.id;
        if (action.meta.requestId === state[id]?.currentRequestId) {
          state[id]!.completions = action.payload.completions;
        }
      })
      .addCase(fetchQuerySuggestions.rejected, (state, action) => {
        state[action.payload!.id]!.error = action.payload!;
      })
      .addCase(updateQuerySetQuery, (state, action) => {
        const {id, query} = action.payload;

        if (id in state) {
          state[id]!.q = query;
        }
      })
      .addCase(clearQuerySuggest, (state, action) => {
        const {id} = action.payload;
        state[id]!.q = '';
        state[id]!.completions = [];
      })
      .addCase(clearQuerySuggestCompletions, (state, action) => {
        state[action.payload.id]!.completions = [];
      })
      .addCase(selectQuerySuggestion, (state, action) => {
        const {id, expression} = action.payload;
        state[id]!.q = expression;
        state[id]!.completions = [];
      })
);
