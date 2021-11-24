import {createReducer} from '@reduxjs/toolkit';
import {
  disableCaseClassifications,
  enableCaseClassifications,
  fetchCaseClassifications,
  setCaseField,
} from './document-suggestions-actions';
import {getCaseFieldsInitialState} from './document-suggestions-state';

export const caseFieldsReducer = createReducer(
  getCaseFieldsInitialState(),

  (builder) => {
    builder
      .addCase(setCaseField, (state, action) => {
        const {fieldName, fieldValue} = action.payload;
        const field = state.fields[fieldName];
        if (field) {
          field.value = fieldValue;
        } else {
          state.fields[fieldName] = {
            value: fieldValue,
            suggestions: [],
          };
        }
      })
      .addCase(enableCaseClassifications, (state) => {
        state.enabled = true;
      })
      .addCase(disableCaseClassifications, (state) => {
        state.enabled = false;
      })
      .addCase(fetchCaseClassifications.rejected, (state, action) => {
        state.status.error = action.payload ?? null;
        state.status.loading = false;
      })
      .addCase(fetchCaseClassifications.fulfilled, (state, action) => {
        Object.entries(action.payload.response.fields).forEach(
          ([fieldName, content]) => {
            state.fields[fieldName].suggestions = content.predictions;
          }
        );
        state.status.lastResponseId = action.payload.response.responseId;
        state.status.error = null;
        state.status.loading = false;
      })
      .addCase(fetchCaseClassifications.pending, (state) => {
        state.status.loading = true;
      });
  }
);
