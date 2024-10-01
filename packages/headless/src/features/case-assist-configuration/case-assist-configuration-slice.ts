import {createReducer} from '@reduxjs/toolkit';
import {setCaseAssistConfiguration} from './case-assist-configuration-actions.js';
import {getCaseAssistConfigurationInitialState} from './case-assist-configuration-state.js';

export const caseAssistConfigurationReducer = createReducer(
  getCaseAssistConfigurationInitialState(),

  (builder) => {
    builder.addCase(setCaseAssistConfiguration, (state, action) => {
      state.caseAssistId = action.payload.caseAssistId;
      state.locale = action.payload.locale;
      state.apiBaseUrl = action.payload.proxyBaseUrl;
    });
  }
);
