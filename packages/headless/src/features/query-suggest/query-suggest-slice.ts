import {createAsyncThunk, createAction, createReducer} from '@reduxjs/toolkit';
import {HeadlessState, QuerySuggestState, QuerySuggestSet} from '../../state';
import {getQuerySuggestions} from '../../api/search/query-suggest/query-suggest-endpoint';

export const registerQuerySuggest = createAction<{
  id: string;
  q?: string;
  count?: number;
}>('querySuggest/register');

export const unregisterQuerySuggest = createAction<{id: string}>(
  'querySuggest/unregister'
);

export const updateQuerySuggestQuery = createAction<{id: string; q: string}>(
  'querySuggest/updateQuery'
);

export const selectQuerySuggestion = createAction<{
  id: string;
  expression: string;
}>('querySuggest/selectSuggestion');

export const clearQuerySuggest = createAction<{id: string}>(
  'querySuggest/clear'
);

export const clearQuerySuggestCompletions = createAction<{id: string}>(
  'querySuggest/clearSuggestions'
);

export const fetchQuerySuggestions = createAsyncThunk(
  'querySuggest/fetch',
  async ({id}: {id: string}, {getState}) => {
    return await getQuerySuggestions(id, getState() as HeadlessState);
  }
);

export const getQuerySuggestInitialState: () => Omit<
  QuerySuggestState,
  'id'
> = () => ({
  completions: [],
  count: 5,
  q: '',
  currentRequestId: '',
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
      .addCase(updateQuerySuggestQuery, (state, action) => {
        const {id, q} = action.payload;
        state[id]!.q = q;
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
