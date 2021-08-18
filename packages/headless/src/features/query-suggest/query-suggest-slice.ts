import {isNullOrUndefined} from '@coveo/bueno';
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
  QuerySuggestSet,
  QuerySuggestState,
} from './query-suggest-state';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {executeSearch} from '../search/search-actions';

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

        const {q} = querySuggest;
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
      .addCase(updateQuerySetQuery, (state, action) => {
        const {id, query} = action.payload;

        if (id in state) {
          updateQuerySuggestQuery(state[id]!, query);
        }
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
      .addCase(selectQuerySuggestion, (state, action) => {
        const {id, expression} = action.payload;
        const querySuggest = state[id];

        if (!querySuggest) {
          return;
        }

        querySuggest.q = expression;
      })
      .addCase(restoreSearchParameters, (state, action) => {
        if (!isNullOrUndefined(action.payload.q)) {
          updateAllQuerySuggestSetQueries(state, action.payload.q);
        }
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const {queryExecuted} = action.payload;
        updateAllQuerySuggestSetQueries(state, queryExecuted);
      })
);

function updateQuerySuggestQuery(state: QuerySuggestState, query: string) {
  state.q = query;
}

function updateAllQuerySuggestSetQueries(
  state: QuerySuggestSet,
  query: string
) {
  Object.keys(state).forEach((id) =>
    updateQuerySuggestQuery(state[id]!, query)
  );
}

function buildQuerySuggest(
  config: Partial<QuerySuggestState>
): QuerySuggestState {
  return {
    id: '',
    completions: [],
    responseId: '',
    count: 5,
    q: '',
    currentRequestId: '',
    error: null,
    partialQueries: [],
    isLoading: false,
    ...config,
  };
}
