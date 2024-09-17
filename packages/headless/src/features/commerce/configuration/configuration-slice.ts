import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  UpdateAnalyticsConfigurationPayload,
  updateBasicConfiguration,
  UpdateBasicConfigurationPayload,
  updateProxyBaseUrl,
  UpdateProxyBaseUrlPayload,
} from './configuration-actions';
import {
  ConfigurationState,
  getConfigurationInitialState,
} from './configuration-state';

export const configurationReducer = createReducer(
  getConfigurationInitialState(),
  (builder) =>
    builder
      .addCase(updateBasicConfiguration, (state, action) => {
        handleUpdateBasicConfiguration(state, action.payload);
      })
      .addCase(updateProxyBaseUrl, (state, action) => {
        handleUpdateCommerceProxyBaseUrl(state, action.payload);
      })
      .addCase(updateAnalyticsConfiguration, (state, action) => {
        handleUpdateCommerceAnalyticsConfiguration(state, action.payload);
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

function handleUpdateCommerceAnalyticsConfiguration(
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
