import {Reducer, createReducer} from '@reduxjs/toolkit';
import {setCaseAssistConfiguration} from './case-assist-configuration-actions.js';
import {CaseAssistConfigurationState, getCaseAssistConfigurationInitialState} from './case-assist-configuration-state.js';

export const caseAssistConfigurationReducer: Reducer<CaseAssistConfigurationState> = createReducer(
  getCaseAssistConfigurationInitialState(),

  (builder) => {
    builder.addCase(setCaseAssistConfiguration, (state, action) => {
      state.caseAssistId = action.payload.caseAssistId;
      state.locale = action.payload.locale;
    });
  }
);
