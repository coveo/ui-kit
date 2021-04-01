import {createReducer} from '@reduxjs/toolkit';
import {
  renewAccessToken,
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  setOriginLevel2,
  setOriginLevel3,
  updateCaseAssistConfiguration,
} from './configuration-actions';
import {
  getConfigurationInitialState,
  searchAPIEndpoint,
  analyticsAPIEndpoint,
} from './configuration-state';

export const configurationReducer = createReducer(
  getConfigurationInitialState(),
  (builder) =>
    builder
      .addCase(updateBasicConfiguration, (state, action) => {
        if (action.payload.accessToken) {
          state.accessToken = action.payload.accessToken;
        }
        if (action.payload.organizationId) {
          state.organizationId = action.payload.organizationId;
        }
        if (action.payload.platformUrl) {
          state.platformUrl = action.payload.platformUrl;
          state.search.apiBaseUrl = `${action.payload.platformUrl}${searchAPIEndpoint}`;
          state.analytics.apiBaseUrl = `${action.payload.platformUrl}${analyticsAPIEndpoint}`;
        }
      })
      .addCase(updateSearchConfiguration, (state, action) => {
        if (action.payload.apiBaseUrl) {
          state.search.apiBaseUrl = action.payload.apiBaseUrl;
        }
        if (action.payload.locale) {
          state.search.locale = action.payload.locale;
        }
      })
      .addCase(updateAnalyticsConfiguration, (state, action) => {
        if (action.payload.enabled !== undefined) {
          state.analytics.enabled = action.payload.enabled;
        }
        if (action.payload.originLevel2 !== undefined) {
          state.analytics.originLevel2 = action.payload.originLevel2;
        }
        if (action.payload.originLevel3 !== undefined) {
          state.analytics.originLevel3 = action.payload.originLevel3;
        }
        if (action.payload.apiBaseUrl !== undefined) {
          state.analytics.apiBaseUrl = action.payload.apiBaseUrl;
        }
        if (action.payload.runtimeEnvironment !== undefined) {
          state.analytics.runtimeEnvironment =
            action.payload.runtimeEnvironment;
        }
      })
      .addCase(updateCaseAssistConfiguration, (state, action) => {
        if (action.payload.caseAssistId !== undefined) {
          state.caseAssist.caseAssistId = action.payload.caseAssistId;
        }
      })
      .addCase(renewAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })
      .addCase(disableAnalytics, (state) => {
        state.analytics.enabled = false;
      })
      .addCase(enableAnalytics, (state) => {
        state.analytics.enabled = true;
      })
      .addCase(setOriginLevel2, (state, action) => {
        state.analytics.originLevel2 = action.payload.originLevel2;
      })
      .addCase(setOriginLevel3, (state, action) => {
        state.analytics.originLevel3 = action.payload.originLevel3;
      })
);
