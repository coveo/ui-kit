import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {
  restoreSearchParameters,
  restoreTab,
} from '../search-parameters/search-parameter-actions.js';
import {updateActiveTab} from '../tab-set/tab-set-actions.js';
import {
  disableAnalytics,
  enableAnalytics,
  setOriginLevel2,
  setOriginLevel3,
  type UpdateAnalyticsConfigurationActionCreatorPayload,
  type UpdateBasicConfigurationActionCreatorPayload,
  type UpdateSearchConfigurationActionCreatorPayload,
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
  updateSearchConfiguration,
} from './configuration-actions.js';
import {
  type ConfigurationState,
  getConfigurationInitialState,
} from './configuration-state.js';
import getMagicCookie from './magic-cookie.js';

export const configurationReducer = createReducer(
  getConfigurationInitialState(),
  (builder) =>
    builder
      .addCase(updateBasicConfiguration, (state, action) => {
        handleUpdateBasicConfiguration(state, action.payload);
      })
      .addCase(updateSearchConfiguration, (state, action) => {
        handleUpdateSearchConfiguration(state, action.payload);
      })
      .addCase(updateAnalyticsConfiguration, (state, action) => {
        handleUpdateAnalyticsConfiguration(state, action.payload);
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
      .addCase(updateActiveTab, (state, action) => {
        state.analytics.originLevel2 = action.payload;
      })
      .addCase(restoreTab, (state, action) => {
        state.analytics.originLevel2 = action.payload;
      })
      .addCase(restoreSearchParameters, (state, action) => {
        if (!isNullOrUndefined(action.payload.tab)) {
          state.analytics.originLevel2 = action.payload.tab;
        }
      })
);

function handleUpdateBasicConfiguration(
  state: ConfigurationState,
  payload: UpdateBasicConfigurationActionCreatorPayload
) {
  if (!isNullOrUndefined(payload.accessToken)) {
    state.accessToken = payload.accessToken;
  }

  state.environment = payload.environment ?? 'prod';

  if (!isNullOrUndefined(payload.organizationId)) {
    state.organizationId = payload.organizationId;
  }
}

function handleUpdateSearchConfiguration(
  state: ConfigurationState,
  payload: UpdateSearchConfigurationActionCreatorPayload
) {
  if (!isNullOrUndefined(payload.proxyBaseUrl)) {
    state.search.apiBaseUrl = payload.proxyBaseUrl;
  }
  if (!isNullOrUndefined(payload.locale)) {
    state.search.locale = payload.locale;
  }
  if (!isNullOrUndefined(payload.timezone)) {
    state.search.timezone = payload.timezone;
  }
  if (!isNullOrUndefined(payload.authenticationProviders)) {
    state.search.authenticationProviders = payload.authenticationProviders;
  }
}

function handleUpdateAnalyticsConfiguration(
  state: ConfigurationState,
  payload: UpdateAnalyticsConfigurationActionCreatorPayload
) {
  if (!isNullOrUndefined(payload.enabled)) {
    state.analytics.enabled = payload.enabled;
  }
  if (!isNullOrUndefined(payload.originContext)) {
    state.analytics.originContext = payload.originContext;
  }
  if (!isNullOrUndefined(payload.originLevel2)) {
    state.analytics.originLevel2 = payload.originLevel2;
  }
  if (!isNullOrUndefined(payload.originLevel3)) {
    state.analytics.originLevel3 = payload.originLevel3;
  }
  if (!isNullOrUndefined(payload.proxyBaseUrl)) {
    state.analytics.apiBaseUrl = payload.proxyBaseUrl;
  }
  if (!isNullOrUndefined(payload.trackingId)) {
    state.analytics.trackingId = payload.trackingId;
  }
  if (!isNullOrUndefined(payload.analyticsMode)) {
    state.analytics.analyticsMode = payload.analyticsMode;
  }
  if (!isNullOrUndefined(payload.source)) {
    state.analytics.source = payload.source;
  }

  try {
    const magicCookie = getMagicCookie();
    if (magicCookie) {
      state.analytics.analyticsMode = 'next';
      state.analytics.trackingId = magicCookie;
    }
  } catch (_) {}

  if (!isNullOrUndefined(payload.runtimeEnvironment)) {
    state.analytics.runtimeEnvironment = payload.runtimeEnvironment;
  }
  if (!isNullOrUndefined(payload.anonymous)) {
    state.analytics.anonymous = payload.anonymous;
  }
  if (!isNullOrUndefined(payload.deviceId)) {
    state.analytics.deviceId = payload.deviceId;
  }
  if (!isNullOrUndefined(payload.userDisplayName)) {
    state.analytics.userDisplayName = payload.userDisplayName;
  }
  if (!isNullOrUndefined(payload.documentLocation)) {
    state.analytics.documentLocation = payload.documentLocation;
  }
}
