import {createReducer} from '@reduxjs/toolkit';
import {fetchQuerySuggestions} from '../../query-suggest/query-suggest-actions';
import {getFieldSuggestionsOrderInitialState} from './field-suggestions-order-state';

export const fieldSuggestionsOrderReducer = createReducer(
  getFieldSuggestionsOrderInitialState(),
  (builder) => {
    builder.addCase(fetchQuerySuggestions.fulfilled, (_, action) => {
      return action.payload.fieldSuggestionsFacets ?? [];
    });
  }
);
