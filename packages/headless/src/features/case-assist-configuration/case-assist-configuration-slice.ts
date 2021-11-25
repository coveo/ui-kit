import {createReducer} from '@reduxjs/toolkit';
import {setCaseAssistConfiguration} from './case-assist-configuration-actions';
import {getCaseAssistConfigurationInitialState} from './case-assist-configuration-state';

export const caseAssistConfigurationReducer = createReducer(
  getCaseAssistConfigurationInitialState(),

  (builder) => {
    builder.addCase(setCaseAssistConfiguration, (state, action) => {
      state.caseAssistId = action.payload.caseAssistId;
      state.locale = action.payload.locale;
    });
  }
);
