import {createReducer} from '@reduxjs/toolkit';
import {
  handleClearQuerySuggest,
  handleFetchPending,
  handleFetchRejected,
  handleRegisterQuerySuggest,
} from '../../query-suggest/query-suggest-reducer-helpers.js';
import {getQuerySuggestSetInitialState} from '../../query-suggest/query-suggest-state.js';
import {
  clearQuerySuggest,
  fetchQuerySuggestions,
  registerQuerySuggest,
} from './query-suggest-actions.js';

export const commerceQuerySuggestReducer = createReducer(
  getQuerySuggestSetInitialState(),
  (builder) =>
    builder
      .addCase(registerQuerySuggest, (state, action) => {
        handleRegisterQuerySuggest(state, action.payload);
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
      .addCase(fetchQuerySuggestions.rejected, handleFetchRejected)
      .addCase(clearQuerySuggest, (state, action) => {
        handleClearQuerySuggest(state, action.payload);
      })
);
