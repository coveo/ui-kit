import {createReducer} from '@reduxjs/toolkit';
import {fetchQuerySuggestions} from '../../query-suggest/query-suggest-actions.js';
import {getFieldSuggestionsOrderInitialState} from './field-suggestions-order-state.js';

export const fieldSuggestionsOrderReducer = createReducer(
  getFieldSuggestionsOrderInitialState(),
  (builder) => {
    builder.addCase(fetchQuerySuggestions.fulfilled, (_, action) => {
      return action.payload.fieldSuggestionsFacets ?? [];
    });
  }
);
