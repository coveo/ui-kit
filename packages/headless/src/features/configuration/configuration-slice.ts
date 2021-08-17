import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  setOriginLevel2,
  setOriginLevel3,
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
        if (action.payload.timezone) {
          state.search.timezone = action.payload.timezone;
        }
      })
      .addCase(updateAnalyticsConfiguration, (state, action) => {
        if (!isNullOrUndefined(action.payload.enabled)) {
          state.analytics.enabled = action.payload.enabled;
        }
        if (!isNullOrUndefined(action.payload.originLevel2)) {
          state.analytics.originLevel2 = action.payload.originLevel2;
        }
        if (!isNullOrUndefined(action.payload.originLevel3)) {
          state.analytics.originLevel3 = action.payload.originLevel3;
        }
        if (!isNullOrUndefined(action.payload.apiBaseUrl)) {
          state.analytics.apiBaseUrl = action.payload.apiBaseUrl;
        }
        if (!isNullOrUndefined(action.payload.runtimeEnvironment)) {
          state.analytics.runtimeEnvironment =
            action.payload.runtimeEnvironment;
        }
        if (!isNullOrUndefined(action.payload.anonymous)) {
          state.analytics.anonymous = action.payload.anonymous;
        }
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
