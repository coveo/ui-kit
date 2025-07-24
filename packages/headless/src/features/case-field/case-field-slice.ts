import {createReducer} from '@reduxjs/toolkit';
import {setError} from '../error/error-actions.js';
import {
  fetchCaseClassifications,
  registerCaseField,
  updateCaseField,
} from './case-field-actions.js';
import {getCaseFieldInitialState} from './case-field-state.js';

export const caseFieldReducer = createReducer(
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
      .addCase(fetchCaseClassifications.rejected, (state, action) => {
        state.status.error = action.payload ?? null;
        state.status.loading = false;
      })
      .addCase(fetchCaseClassifications.fulfilled, (state, action) => {
        const defaultField = {value: '', suggestions: []};
        Object.entries(action.payload.response.fields).forEach(
          ([fieldName, content]) => {
            if (!state.fields[fieldName]) {
              state.fields[fieldName] = {...defaultField};
            }

            state.fields[fieldName].suggestions = content.predictions;
          }
        );
        state.status.lastResponseId = action.payload.response.responseId;
        state.status.error = null;
        state.status.loading = false;
      })
      .addCase(fetchCaseClassifications.pending, (state) => {
        state.status.loading = true;
      })
      .addCase(setError, (state, action) => {
        state.status.error = action.payload;
        state.status.loading = false;
      });
  }
);
