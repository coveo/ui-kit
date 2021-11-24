import {createReducer} from '@reduxjs/toolkit';
import {
  disableCaseClassifications,
  enableCaseClassifications,
  fetchCaseClassifications,
  registerCaseField,
  updateCaseField,
} from './case-field-actions';
import {getCaseFieldInitialState} from './case-field-state';

export const caseFieldsReducer = createReducer(
  getCaseFieldInitialState(),

  (builder) => {
    builder
      .addCase(registerCaseField, (state, action) => {
        const {fieldName, fieldValue} = action.payload;
        state.fields[fieldName] = {
          value: fieldValue,
          suggestions: [],
        };
      })
      .addCase(updateCaseField, (state, action) => {
        const {fieldName, fieldValue} = action.payload;
        state.fields[fieldName].value = fieldValue;
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
