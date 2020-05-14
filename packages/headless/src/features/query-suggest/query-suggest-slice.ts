import {createAsyncThunk, createReducer, createAction} from '@reduxjs/toolkit';
import {HeadlessState, QuerySuggestState} from '../../state';
import {getQuerySuggestions} from '../../api/search/query-suggest/query-suggest-endpoint';

export const registerQuerySuggest = createAction<{q: string; count: number}>(
  'querySuggest/register'
);

export const updateQuerySuggestQuery = createAction<{q: string}>(
  'querySuggest/updateQuery'
);

export const selectQuerySuggestion = createAction<{expression: string}>(
  'querySuggest/selectSuggestion'
);

export const clearQuerySuggest = createAction('querySuggest/clear');

export const clearQuerySuggestCompletions = createAction(
  'querySuggest/clearSuggestions'
);

export const fetchQuerySuggestions = createAsyncThunk(
  'querySuggest/fetch',
  async (_, {getState}) => {
    return await getQuerySuggestions(getState() as HeadlessState);
  }
);

export const getQuerySuggestInitialState: () => QuerySuggestState = () => ({
  completions: [],
  count: 5,
  q: '',
  currentRequestId: '',
});

export const querySuggestReducer = createReducer(
  getQuerySuggestInitialState(),
  builder =>
    builder
      .addCase(registerQuerySuggest, (state, action) => {
        state.count = action.payload.count;
        state.q = action.payload.q;
      })
      .addCase(fetchQuerySuggestions.pending, (state, action) => {
        state.currentRequestId = action.meta.requestId;
      })
      .addCase(fetchQuerySuggestions.fulfilled, (state, action) => {
        if (action.meta.requestId === state.currentRequestId) {
          state.completions = action.payload.completions;
        }
      })
      .addCase(updateQuerySuggestQuery, (state, action) => {
        state.q = action.payload.q;
      })
      .addCase(clearQuerySuggest, state => {
        state.q = '';
        state.completions = [];
      })
      .addCase(clearQuerySuggestCompletions, state => {
        state.completions = [];
      })
      .addCase(selectQuerySuggestion, (state, action) => {
        state.q = action.payload.expression;
        state.completions = [];
      })
);
