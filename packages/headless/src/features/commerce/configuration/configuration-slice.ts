import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {updateBasicConfiguration} from '../../configuration/configuration-actions.js';
import {
  disableAnalytics,
  enableAnalytics,
  type UpdateAnalyticsConfigurationPayload,
  type UpdateBasicConfigurationPayload,
  type UpdateProxyBaseUrlPayload,
  updateAnalyticsConfiguration,
  updateBasicConfiguration as updateBasicCommerceConfiguration,
  updateProxyBaseUrl,
} from './configuration-actions.js';
import {
  type ConfigurationState,
  getConfigurationInitialState,
} from './configuration-state.js';

export const configurationReducer = createReducer(
  getConfigurationInitialState(),
  (builder) =>
    builder
      .addCase(updateBasicCommerceConfiguration, (state, action) => {
        handleUpdateBasicConfiguration(state, action.payload);
      })
      // This is to handle the renew access token middleware
      .addCase(updateBasicConfiguration, (state, action) => {
        handleUpdateBasicConfiguration(state, action.payload);
      })
      .addCase(updateProxyBaseUrl, (state, action) => {
        handleUpdateCommerceProxyBaseUrl(state, action.payload);
      })
      .addCase(updateAnalyticsConfiguration, (state, action) => {
        handleupdateAnalyticsConfiguration(state, action.payload);
      })
      .addCase(disableAnalytics, (state) => {
        state.analytics.enabled = false;
      })
      .addCase(enableAnalytics, (state) => {
        state.analytics.enabled = true;
      })
);

function handleUpdateBasicConfiguration(
  state: ConfigurationState,
  payload: UpdateBasicConfigurationPayload
) {
  if (!isNullOrUndefined(payload.accessToken)) {
    state.accessToken = payload.accessToken;
  }

  state.environment = payload.environment ?? 'prod';

  if (!isNullOrUndefined(payload.organizationId)) {
    state.organizationId = payload.organizationId;
  }
}

function handleUpdateCommerceProxyBaseUrl(
  state: ConfigurationState,
  payload: UpdateProxyBaseUrlPayload
) {
  if (!isNullOrUndefined(payload.proxyBaseUrl)) {
    state.commerce.apiBaseUrl = payload.proxyBaseUrl;
  }
}

function handleupdateAnalyticsConfiguration(
  state: ConfigurationState,
  payload: UpdateAnalyticsConfigurationPayload
) {
  if (!isNullOrUndefined(payload.enabled)) {
    state.analytics.enabled = payload.enabled;
  }
  if (!isNullOrUndefined(payload.proxyBaseUrl)) {
    state.analytics.apiBaseUrl = payload.proxyBaseUrl;
  }
  if (!isNullOrUndefined(payload.source)) {
    state.analytics.source = payload.source;
  }
  if (!isNullOrUndefined(payload.trackingId)) {
    state.analytics.trackingId = payload.trackingId;
  }
}
