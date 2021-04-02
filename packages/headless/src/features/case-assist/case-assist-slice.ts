import {createReducer} from '@reduxjs/toolkit';
import {
  getClassifications,
  getDocumentSuggestions,
  setCaseInformationValue,
} from './case-assist-actions';
import {getCaseAssistInitialState} from './case-assist-state';

export const caseAssistReducer = createReducer(
  getCaseAssistInitialState(),
  (builder) => {
    builder
      .addCase(setCaseInformationValue, (state, action) => {
        state.caseInformation[action.payload.fieldName] =
          action.payload.fieldValue;
      })
      .addCase(getClassifications.pending, (state) => {
        state.classifications.loading = true;
      })
      .addCase(getClassifications.fulfilled, (state, action) => {
        state.classifications = {
          fields: action.payload.fields,
          responseId: action.payload.responseId,
          loading: false,
          error: null,
        };
      })
      .addCase(getClassifications.rejected, (state, action) => {
        state.classifications = {
          ...state.classifications,
          loading: false,
          error: action.payload?.error,
        };
      })
      .addCase(getDocumentSuggestions.pending, (state) => {
        state.documentSuggestions.loading = true;
      })
      .addCase(getDocumentSuggestions.fulfilled, (state, action) => {
        state.documentSuggestions = {
          documents: action.payload.documents,
          totalCount: action.payload.totalCount,
          responseId: action.payload.responseId,
          loading: false,
          error: null,
        };
      })
      .addCase(getDocumentSuggestions.rejected, (state, action) => {
        state.documentSuggestions = {
          ...state.documentSuggestions,
          loading: false,
          error: action.payload?.error,
        };
      });
  }
);
