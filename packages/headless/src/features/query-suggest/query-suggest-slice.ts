import {createReducer} from '@reduxjs/toolkit';
import {
  clearQuerySuggest,
  fetchQuerySuggestions,
  registerQuerySuggest,
  selectQuerySuggestion,
  unregisterQuerySuggest,
} from './query-suggest-actions';
import {updateQuerySetQuery} from '../query-set/query-set-actions';
import {
  getQuerySuggestSetInitialState,
  QuerySuggestState,
} from './query-suggest-state';

export const querySuggestReducer = createReducer(
  getQuerySuggestSetInitialState(),
  (builder) =>
    builder
      .addCase(registerQuerySuggest, (state, action) => {
        state[action.payload.id] = buildQuerySuggest(action.payload);
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

        const {q} = querySuggest;
        if (q) {
          querySuggest.partialQueries.push(
            q.replace(/;/, encodeURIComponent(';'))
          );
        }
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
      .addCase(updateQuerySetQuery, (state, action) => {
        const {id, query} = action.payload;

        if (id in state) {
          state[id]!.q = query;
        }
      })
      .addCase(clearQuerySuggest, (state, action) => {
        const querySuggest = state[action.payload.id];

        if (!querySuggest) {
          return;
        }

        querySuggest.q = '';
        querySuggest.completions = [];
        querySuggest.partialQueries = [];
      })
      .addCase(selectQuerySuggestion, (state, action) => {
        const {id, expression} = action.payload;
        const querySuggest = state[id];

        if (!querySuggest) {
          return;
        }

        querySuggest.q = expression;
      })
);

function buildQuerySuggest(
  config: Partial<QuerySuggestState>
): QuerySuggestState {
  return {
    id: '',
    completions: [],
    count: 5,
    q: '',
    currentRequestId: '',
    error: null,
    partialQueries: [],
    isLoading: false,
    ...config,
  };
}
