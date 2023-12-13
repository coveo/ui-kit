import {AnyAction, type Draft as WritableDraft} from '@reduxjs/toolkit';
import {createReducer} from '@reduxjs/toolkit';
import {fetchQuerySuggestions as fetchCommerceQuerySuggestions} from '../commerce/query-suggest/query-suggest-actions';
import {
  clearQuerySuggest,
  fetchQuerySuggestions,
  registerQuerySuggest,
  unregisterQuerySuggest,
} from './query-suggest-actions';
import {
  getQuerySuggestSetInitialState,
  QuerySuggestSet,
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
      .addCase(fetchQuerySuggestions.pending, handleFetchPending)
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
      .addCase(fetchQuerySuggestions.rejected, handleFetchRejected)
      .addCase(fetchCommerceQuerySuggestions.pending, handleFetchPending)
      .addCase(fetchCommerceQuerySuggestions.fulfilled, (state, action) => {
        const querySuggest = state[action.meta.arg.id];

        if (
          !querySuggest ||
          action.meta.requestId !== querySuggest.currentRequestId
        ) {
          return;
        }

        const {query} = action.payload;
        if (query) {
          querySuggest.partialQueries.push(
            query.replace(/;/, encodeURIComponent(';'))
          );
        }
        querySuggest.responseId = action.payload.responseId;
        querySuggest.completions = action.payload.completions.map(
          (completion) => ({
            expression: completion.expression,
            highlighted: completion.highlighted,
            score: 0,
            executableConfidence: 0,
          })
        );
        querySuggest.isLoading = false;
        querySuggest.error = null;
      })
      .addCase(fetchCommerceQuerySuggestions.rejected, handleFetchRejected)
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

function handleFetchPending(
  state: WritableDraft<QuerySuggestSet>,
  action: AnyAction
) {
  const querySuggest = state[action.meta.arg.id];

  if (!querySuggest) {
    return;
  }

  querySuggest.currentRequestId = action.meta.requestId;
  querySuggest.isLoading = true;
}

function handleFetchRejected(
  state: WritableDraft<QuerySuggestSet>,
  action: AnyAction
) {
  const querySuggest = state[action.meta.arg.id];

  if (!querySuggest) {
    return;
  }

  querySuggest.error = action.payload || null;
  querySuggest.isLoading = false;
}
