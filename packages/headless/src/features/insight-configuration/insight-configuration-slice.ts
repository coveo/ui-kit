import {createReducer} from '@reduxjs/toolkit';
import {setInsightConfiguration} from './insight-configuration-actions';
import {getInsightConfigurationInitialState} from './insight-configuration-state';

export const insightConfigurationReducer = createReducer(
  getInsightConfigurationInitialState(),
  (builder) => {
    builder.addCase(setInsightConfiguration, (state, action) => {
      state.insightId = action.payload.insightId;
    });
  }
);
