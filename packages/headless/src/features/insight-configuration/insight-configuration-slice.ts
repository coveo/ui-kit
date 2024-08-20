import {createReducer} from '@reduxjs/toolkit';
import {
  setInsightConfiguration,
  updateInsightSearchConfiguration,
} from './insight-configuration-actions';
import {getInsightConfigurationInitialState} from './insight-configuration-state';

export const insightConfigurationReducer = createReducer(
  getInsightConfigurationInitialState(),
  (builder) =>
    builder
      .addCase(setInsightConfiguration, (state, action) => {
        state.insightId = action.payload.insightId;
      })
      .addCase(updateInsightSearchConfiguration, (state, action) => {
        if (action.payload.locale) {
          state.search.locale = action.payload.locale;
        }
        if (action.payload.timezone) {
          state.search.timezone = action.payload.timezone;
        }
      })
);
