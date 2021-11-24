import {createReducer} from '@reduxjs/toolkit';
import {fetchDocumentSuggestions} from './document-suggestions-actions';
import {getDocumentSuggestionsInitialState} from './document-suggestions-state';

export const documentSuggestionsReducer = createReducer(
  getDocumentSuggestionsInitialState(),

  (builder) => {
    builder
      .addCase(fetchDocumentSuggestions.rejected, (state, action) => {
        state.status.error = action.payload ?? null;
        state.status.loading = false;
      })
      .addCase(fetchDocumentSuggestions.fulfilled, (state, action) => {
        state.documents = action.payload.response.documents;
        state.status.lastResponseId = action.payload.response.responseId;
        state.status.error = null;
        state.status.loading = false;
      })
      .addCase(fetchDocumentSuggestions.pending, (state) => {
        state.status.loading = true;
      });
  }
);
