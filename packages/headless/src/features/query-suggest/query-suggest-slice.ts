import {createReducer} from '@reduxjs/toolkit';
import {setError} from '../error/error-actions.js';
import {
  clearQuerySuggest,
  fetchQuerySuggestions,
  registerQuerySuggest,
  unregisterQuerySuggest,
} from './query-suggest-actions.js';
import {
  handleClearQuerySuggest,
  handleFetchPending,
  handleFetchRejected,
  handleRegisterQuerySuggest,
} from './query-suggest-reducer-helpers.js';
import {getQuerySuggestSetInitialState} from './query-suggest-state.js';

export const querySuggestReducer = createReducer(
  getQuerySuggestSetInitialState(),
  (builder) =>
    builder
      .addCase(registerQuerySuggest, (state, action) => {
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
      .addCase(clearQuerySuggest, (state, action) => {
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
