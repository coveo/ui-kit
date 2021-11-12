import {createReducer} from '@reduxjs/toolkit';
import {setCaseAssistId} from './case-assist-actions';
import {getCaseAssistInitialState} from './case-assist-state';

export const caseAssistReducer = createReducer(
  getCaseAssistInitialState(),

  (builder) => {
    builder.addCase(setCaseAssistId, (state, action) => {
      state.caseAssistId = action.payload.id;
    });
  }
);
