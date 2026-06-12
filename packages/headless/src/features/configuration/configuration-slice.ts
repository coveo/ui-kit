import {createReducer} from '@reduxjs/toolkit';
import {
  restoreSearchParameters,
  restoreTab,
} from '../search-parameters/search-parameter-actions.js';
import {updateActiveTab} from '../tab-set/tab-set-actions.js';
import {
  disableAnalytics,
  enableAnalytics,
  setAgentId,
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
import {
  getMagicCookie,
  getSearchAgentDebugMagicCookie,
} from './magic-cookie.js';

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
        if (action.payload.tab != null) {
          state.analytics.originLevel2 = action.payload.tab;
        }
      })
      .addCase(setAgentId, (state, {payload}) => {
        handleUpdateAgentId(state, payload);
      })
);

function handleUpdateBasicConfiguration(
  state: ConfigurationState,
  payload: UpdateBasicConfigurationActionCreatorPayload
) {
  if (payload.accessToken != null) {
    state.accessToken = payload.accessToken;
  }

  state.environment = payload.environment ?? 'prod';

  if (payload.organizationId != null) {
    state.organizationId = payload.organizationId;
  }
}

function handleUpdateSearchConfiguration(
  state: ConfigurationState,
  payload: UpdateSearchConfigurationActionCreatorPayload
) {
  if (payload.proxyBaseUrl != null) {
    state.search.apiBaseUrl = payload.proxyBaseUrl;
  }
  if (payload.locale != null) {
    state.search.locale = payload.locale;
  }
  if (payload.timezone != null) {
    state.search.timezone = payload.timezone;
  }
  if (payload.authenticationProviders != null) {
    state.search.authenticationProviders = payload.authenticationProviders;
  }
}

function handleUpdateAnalyticsConfiguration(
  state: ConfigurationState,
  payload: UpdateAnalyticsConfigurationActionCreatorPayload
) {
  if (payload.enabled != null) {
    state.analytics.enabled = payload.enabled;
  }
  if (payload.originContext != null) {
    state.analytics.originContext = payload.originContext;
  }
  if (payload.originLevel2 != null) {
    state.analytics.originLevel2 = payload.originLevel2;
  }
  if (payload.originLevel3 != null) {
    state.analytics.originLevel3 = payload.originLevel3;
  }
  if (payload.proxyBaseUrl != null) {
    state.analytics.apiBaseUrl = payload.proxyBaseUrl;
  }
  if (payload.trackingId != null) {
    state.analytics.trackingId = payload.trackingId;
  }
  if (payload.analyticsMode != null) {
    state.analytics.analyticsMode = payload.analyticsMode;
  }
  if (payload.source != null) {
    state.analytics.source = payload.source;
  }

  try {
    const magicCookie = getMagicCookie();
    if (magicCookie) {
      state.analytics.analyticsMode = 'next';
      state.analytics.trackingId = magicCookie;
    }
  } catch (_) {}

  if (payload.runtimeEnvironment != null) {
    state.analytics.runtimeEnvironment = payload.runtimeEnvironment;
  }
  if (payload.anonymous != null) {
    state.analytics.anonymous = payload.anonymous;
  }
  if (payload.deviceId != null) {
    state.analytics.deviceId = payload.deviceId;
  }
  if (payload.userDisplayName != null) {
    state.analytics.userDisplayName = payload.userDisplayName;
  }
  if (payload.documentLocation != null) {
    state.analytics.documentLocation = payload.documentLocation;
  }
}

function handleUpdateAgentId(state: ConfigurationState, payload: string) {
  state.knowledge.agentId = payload;
  try {
    const searchAgentDebugMagicCookie = getSearchAgentDebugMagicCookie();
    if (searchAgentDebugMagicCookie != null) {
      state.knowledge.debugAgentSession = true;
    }
  } catch (_) {}
}
