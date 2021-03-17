import {createReducer} from '@reduxjs/toolkit';
import {getClassifications} from './case-assist-actions';
import {getCaseAssistInitialState} from './case-assist-state';

export const caseAssistReducer = createReducer(
  getCaseAssistInitialState(),
  (builder) => {
    builder
      .addCase(getClassifications.pending, (state) => {
        state.classifications.loading = true;
      })
      .addCase(getClassifications.fulfilled, (state, action) => {
        if (action.payload) {
          state.classifications = {
            fields: action.payload.classifications.fields,
            responseId: action.payload.classifications.responseId,
            loading: false,
            error: null,
          };
        }
      })
      .addCase(getClassifications.rejected, (state, action) => {
        state.classifications = {
          fields: [],
          responseId: '',
          loading: false,
          error: {
            message: action.error.message,
          },
        };
      });
  }
);
