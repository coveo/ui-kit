import {createReducer} from '@reduxjs/toolkit';
import {setInsightConfiguration} from './insight-configuration-actions.js';
import {getInsightConfigurationInitialState} from './insight-configuration-state.js';

export const insightConfigurationReducer = createReducer(
  getInsightConfigurationInitialState(),
  (builder) => {
    builder.addCase(setInsightConfiguration, (state, action) => {
      state.insightId = action.payload.insightId;
    });
  }
);
