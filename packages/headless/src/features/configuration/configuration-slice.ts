import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer} from '@reduxjs/toolkit';
import {getOrganizationEndpoints} from '../../api/platform-client';
import {
  matchCoveoOrganizationEndpointUrl,
  isCoveoPlatformURL,
} from '../../utils/url-utils';
import {
  updateBasicConfiguration as updateCommerceBasicConfiguration,
  updateAnalyticsConfiguration as updateCommerceAnalyticsConfiguration,
  disableAnalytics as disableCommerceAnalytics,
  enableAnalytics as enableCommerceAnalytics,
} from '../commerce/configuration/configuration-actions';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {updateActiveTab} from '../tab-set/tab-set-actions';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  updateAnalyticsConfiguration,
  setOriginLevel2,
  setOriginLevel3,
  UpdateBasicConfigurationActionCreatorPayload,
} from './configuration-actions';
import {
  getConfigurationInitialState,
  searchAPIEndpoint,
  analyticsAPIEndpoint,
  ConfigurationState,
} from './configuration-state';

function legacyAnalyticsUrlFromPlatformUrl(
  platformUrl: string,
  organizationId: string
) {
  const matchCoveoPlatformURL = isCoveoPlatformURL(platformUrl);
  if (matchCoveoPlatformURL) {
    return (
      platformUrl.replace(/^(https:\/\/)platform/, '$1analytics') +
      analyticsAPIEndpoint
    );
  }

  const matchCoveoOrganizationEndpoints = matchCoveoOrganizationEndpointUrl(
    platformUrl,
    organizationId
  );

  if (matchCoveoOrganizationEndpoints) {
    return getOrganizationEndpoints(
      organizationId,
      matchCoveoOrganizationEndpoints.environment
    ).analytics;
  }

  return platformUrl;
}

export const configurationReducer = createReducer(
  getConfigurationInitialState(),
  (builder) =>
    builder
      .addCase(updateBasicConfiguration, (state, action) => {
        handleUpdateBasicConfiguration(state, action.payload);
      })
      .addCase(updateCommerceBasicConfiguration, (state, action) => {
        handleUpdateBasicConfiguration(state, action.payload);
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
        if (action.payload.authenticationProviders) {
          state.search.authenticationProviders =
            action.payload.authenticationProviders;
        }
      })
      .addCase(updateAnalyticsConfiguration, (state, action) => {
        if (!isNullOrUndefined(action.payload.enabled)) {
          state.analytics.enabled = action.payload.enabled;
        }
        if (!isNullOrUndefined(action.payload.originContext)) {
          state.analytics.originContext = action.payload.originContext;
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
        if (!isNullOrUndefined(action.payload.nextApiBaseUrl)) {
          state.analytics.nextApiBaseUrl = action.payload.nextApiBaseUrl;
        }
        if (!isNullOrUndefined(action.payload.trackingId)) {
          state.analytics.trackingId = action.payload.trackingId;
        }
        if (!isNullOrUndefined(action.payload.analyticsMode)) {
          state.analytics.analyticsMode = action.payload.analyticsMode;
        }
        if (!isNullOrUndefined(action.payload.source)) {
          state.analytics.source = action.payload.source;
        }
        if (!isNullOrUndefined(action.payload.runtimeEnvironment)) {
          state.analytics.runtimeEnvironment =
            action.payload.runtimeEnvironment;
        }
        if (!isNullOrUndefined(action.payload.anonymous)) {
          state.analytics.anonymous = action.payload.anonymous;
        }
        if (!isNullOrUndefined(action.payload.deviceId)) {
          state.analytics.deviceId = action.payload.deviceId;
        }
        if (!isNullOrUndefined(action.payload.userDisplayName)) {
          state.analytics.userDisplayName = action.payload.userDisplayName;
        }
        if (!isNullOrUndefined(action.payload.documentLocation)) {
          state.analytics.documentLocation = action.payload.documentLocation;
        }
      })
      .addCase(updateCommerceAnalyticsConfiguration, (state, action) => {
        if (!isNullOrUndefined(action.payload.enabled)) {
          state.analytics.enabled = action.payload.enabled;
        }
        if (!isNullOrUndefined(action.payload.trackingId)) {
          state.analytics.trackingId = action.payload.trackingId;
        }
        if (!isNullOrUndefined(action.payload.source)) {
          state.analytics.source = action.payload.source;
        }
      })
      .addCase(disableAnalytics, (state) => {
        state.analytics.enabled = false;
      })
      .addCase(disableCommerceAnalytics, (state) => {
        state.analytics.enabled = false;
      })
      .addCase(enableAnalytics, (state) => {
        state.analytics.enabled = true;
      })
      .addCase(enableCommerceAnalytics, (state) => {
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
      .addCase(restoreSearchParameters, (state, action) => {
        state.analytics.originLevel2 =
          action.payload.tab || state.analytics.originLevel2;
      })
);

function handleUpdateBasicConfiguration(
  state: ConfigurationState,
  payload: UpdateBasicConfigurationActionCreatorPayload
) {
  if (payload.accessToken) {
    state.accessToken = payload.accessToken;
  }
  if (payload.organizationId) {
    state.organizationId = payload.organizationId;
  }
  if (payload.platformUrl) {
    state.platformUrl = payload.platformUrl;
    state.search.apiBaseUrl = `${payload.platformUrl}${searchAPIEndpoint}`;
    state.analytics.apiBaseUrl = legacyAnalyticsUrlFromPlatformUrl(
      payload.platformUrl,
      state.organizationId
    );
  }
}
