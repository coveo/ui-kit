import {createReducer} from '@reduxjs/toolkit';
import {
  getClassifications,
  setCaseAssistId,
  setCaseInformationValue,
  setUserContextValue,
} from './case-assist-actions';
import {getCaseAssistInitialState} from './case-assist-state';

export const caseAssistReducer = createReducer(
  getCaseAssistInitialState(),
  (builder) => {
    builder
      .addCase(setCaseAssistId, (state, action) => {
        state.caseAssistId = action.payload.id;
      })
      .addCase(setCaseInformationValue, (state, action) => {
        state.caseInformation[action.payload.fieldName] =
          action.payload.fieldValue;
      })
      .addCase(setUserContextValue, (state, action) => {
        state.userContext[action.payload.key] = action.payload.value;
      })
      .addCase(getClassifications.pending, (state) => {
        state.classifications.loading = true;
      })
      .addCase(getClassifications.fulfilled, (state, action) => {
        state.classifications = {
          fields: action.payload.classifications.fields,
          responseId: action.payload.classifications.responseId,
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
      });
  }
);
