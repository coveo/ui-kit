import {createReducer} from '@reduxjs/toolkit';
import {
  clearQuerySuggest,
  fetchQuerySuggestions,
  registerQuerySuggest,
  unregisterQuerySuggest,
} from './query-suggest-actions';
import {
  getQuerySuggestSetInitialState,
  QuerySuggestState,
} from './query-suggest-state';

export const querySuggestReducer = createReducer(
  getQuerySuggestSetInitialState(),
  (builder) =>
    builder
      .addCase(registerQuerySuggest, (state, action) => {
        const id = action.payload.id;

        if (id in state) {
          return;
        }

        state[id] = buildQuerySuggest(action.payload);
      })
      .addCase(unregisterQuerySuggest, (state, action) => {
        delete state[action.payload.id];
      })
      .addCase(fetchQuerySuggestions.pending, (state, action) => {
        const querySuggest = state[action.meta.arg.id];

        if (!querySuggest) {
          return;
        }

        querySuggest.currentRequestId = action.meta.requestId;
        querySuggest.isLoading = true;
      })
      .addCase(fetchQuerySuggestions.fulfilled, (state, action) => {
        const querySuggest = state[action.meta.arg.id];

        if (
          !querySuggest ||
          action.meta.requestId !== querySuggest.currentRequestId
        ) {
          return;
        }

        const {q} = action.payload;
        if (q) {
          querySuggest.partialQueries.push(
            q.replace(/;/, encodeURIComponent(';'))
          );
        }
        querySuggest.responseId = action.payload.responseId;
        querySuggest.completions = action.payload.completions;
        querySuggest.isLoading = false;
        querySuggest.error = null;
      })
      .addCase(fetchQuerySuggestions.rejected, (state, action) => {
        const querySuggest = state[action.meta.arg.id];

        if (!querySuggest) {
          return;
        }

        querySuggest.error = action.payload || null;
        querySuggest.isLoading = false;
      })
      .addCase(clearQuerySuggest, (state, action) => {
        const querySuggest = state[action.payload.id];

        if (!querySuggest) {
          return;
        }

        querySuggest.responseId = '';
        querySuggest.completions = [];
        querySuggest.partialQueries = [];
      })
);

function buildQuerySuggest(
  config: Partial<QuerySuggestState>
): QuerySuggestState {
  return {
    id: '',
    completions: [],
    responseId: '',
    count: 5,
    currentRequestId: '',
    error: null,
    partialQueries: [],
    isLoading: false,
    ...config,
  };
}
