import {createReducer} from '@reduxjs/toolkit';
import {setCaseAssistId} from './case-fields-actions';
import {getCaseFieldsInitialState} from './case-fields-state';

export const caseFieldsReducer = createReducer(
  getCaseFieldsInitialState(),

  (builder) => {
    builder.addCase(setCaseAssistId, (state, action) => {
      state.caseAssistId = action.payload.id;
    });
  }
);
