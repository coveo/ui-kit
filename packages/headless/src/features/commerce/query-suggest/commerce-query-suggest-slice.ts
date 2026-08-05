import {createReducer} from '@reduxjs/toolkit';
import type {Draft as WritableDraft} from '@reduxjs/toolkit';
import {
  handleClearQuerySuggest,
  handleFetchPending,
  handleFetchRejected,
} from '../../query-suggest/query-suggest-reducer-helpers.js';
import {
  type QuerySuggestSet,
  type QuerySuggestState,
  getQuerySuggestSetInitialState,
} from '../../query-suggest/query-suggest-state.js';
import {
  clearQuerySuggest,
  fetchQuerySuggestions,
  registerQuerySuggest,
  type RegisterQuerySuggestPayload,
} from './query-suggest-actions.js';

export type CommerceQuerySuggestState = Omit<QuerySuggestState, 'count'> & {
  count: number | undefined;
};

export const commerceQuerySuggestReducer = createReducer(
  getQuerySuggestSetInitialState(),
  (builder) =>
    builder
      .addCase(registerQuerySuggest, (state, action) => {
        handleCommerceRegisterQuerySuggest(state, action.payload);
      })
      .addCase(fetchQuerySuggestions.pending, handleFetchPending)
      .addCase(fetchQuerySuggestions.fulfilled, (state, action) => {
        const querySuggest = state[action.meta.arg.id];

        if (!querySuggest || action.meta.requestId !== querySuggest.currentRequestId) {
          return;
        }

        const {query} = action.payload;
        if (query) {
          querySuggest.partialQueries.push(query.replace(/;/, encodeURIComponent(';')));
        }
        querySuggest.responseId = action.payload.responseId;
        querySuggest.completions = action.payload.completions.map((completion) => ({
          expression: completion.expression,
          highlighted: completion.highlighted,
          score: 0,
          executableConfidence: 0,
        }));
        querySuggest.isLoading = false;
        querySuggest.error = null;
      })
      .addCase(fetchQuerySuggestions.rejected, handleFetchRejected)
      .addCase(clearQuerySuggest, (state, action) => {
        handleClearQuerySuggest(state, action.payload);
      })
);

function handleCommerceRegisterQuerySuggest(
  state: WritableDraft<QuerySuggestSet>,
  payload: RegisterQuerySuggestPayload
) {
  const id = payload.id;

  if (id in state) {
    if (payload.count !== undefined) {
      state[id]!.count = payload.count;
    }
    return;
  }

  state[id] = buildCommerceQuerySuggest(payload) as QuerySuggestState;
}

function buildCommerceQuerySuggest(
  config: Partial<CommerceQuerySuggestState>
): CommerceQuerySuggestState {
  return {
    id: '',
    completions: [],
    responseId: '',
    count: undefined,
    currentRequestId: '',
    error: null,
    partialQueries: [],
    isLoading: false,
    ...config,
  };
}
