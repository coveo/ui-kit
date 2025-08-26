import {
  type AnyAction,
  createReducer,
  type Draft as WritableDraft,
} from '@reduxjs/toolkit';
import {
  clearQuerySuggest as clearCommerceQuerySuggest,
  fetchQuerySuggestions as fetchCommerceQuerySuggestions,
  registerQuerySuggest as registerCommerceQuerySuggest,
} from '../commerce/query-suggest/query-suggest-actions.js';
import {setError} from '../error/error-actions.js';
import {
  type ClearQuerySuggestActionCreatorPayload,
  clearQuerySuggest,
  fetchQuerySuggestions,
  type RegisterQuerySuggestActionCreatorPayload,
  registerQuerySuggest,
  unregisterQuerySuggest,
} from './query-suggest-actions.js';
import {
  getQuerySuggestSetInitialState,
  type QuerySuggestSet,
  type QuerySuggestState,
} from './query-suggest-state.js';

export const querySuggestReducer = createReducer(
  getQuerySuggestSetInitialState(),
  (builder) =>
    builder
      .addCase(registerQuerySuggest, (state, action) => {
        handleRegisterQuerySuggest(state, action.payload);
      })
      .addCase(registerCommerceQuerySuggest, (state, action) => {
        handleRegisterQuerySuggest(state, action.payload);
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
        handleClearQuerySuggest(state, action.payload);
      })
      .addCase(clearCommerceQuerySuggest, (state, action) => {
        handleClearQuerySuggest(state, action.payload);
      })
      .addCase(setError, (state, action) => {
        Object.keys(state).forEach((slotId) => {
          const slot = state[slotId];
          if (slot) {
            slot.error = action.payload;
            slot.isLoading = false;
          }
        });
      })
);

function handleRegisterQuerySuggest(
  state: WritableDraft<QuerySuggestSet>,
  payload: RegisterQuerySuggestActionCreatorPayload
) {
  const id = payload.id;

  if (id in state) {
    return;
  }

  state[id] = buildQuerySuggest(payload);
}

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

function handleClearQuerySuggest(
  state: WritableDraft<QuerySuggestSet>,
  payload: ClearQuerySuggestActionCreatorPayload
) {
  const querySuggest = state[payload.id];

  if (!querySuggest) {
    return;
  }

  querySuggest.responseId = '';
  querySuggest.completions = [];
  querySuggest.partialQueries = [];
}
