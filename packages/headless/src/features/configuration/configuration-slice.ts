import {isNullOrUndefined} from '@coveo/bueno';
//@ts-expect-error package is just an alias resolved in esbuild
import getMagicCookie from '@coveo/pendragon';
import {createReducer} from '@reduxjs/toolkit';
import {
  getDefaultAnalyticsNextEndpointBaseUrl,
  getDefaultOrganizationEndpointBaseUrl,
  getDefaultSearchEndpointBaseUrl,
} from '../../api/platform-client';
import {matchCoveoOrganizationEndpointUrlAnyOrganization} from '../../utils/url-utils';
import {
  updateBasicConfiguration as updateCommerceBasicConfiguration,
  updateAnalyticsConfiguration as updateCommerceAnalyticsConfiguration,
  disableAnalytics as disableCommerceAnalytics,
  enableAnalytics as enableCommerceAnalytics,
  updateProxyBaseUrl as updateCommerceProxyBaseUrl,
  UpdateProxyBaseUrlPayload,
} from '../commerce/configuration/configuration-actions';
import {UpdateAnalyticsConfigurationPayload as UpdateCommerceAnalyticsConfigurationPayload} from '../commerce/configuration/configuration-actions';
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
  UpdateSearchConfigurationActionCreatorPayload,
  UpdateAnalyticsConfigurationActionCreatorPayload,
} from './configuration-actions';
import {
  getConfigurationInitialState,
  ConfigurationState,
} from './configuration-state';

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
        handleUpdateSearchConfiguration(state, action.payload);
      })
      .addCase(updateCommerceProxyBaseUrl, (state, action) => {
        handleUpdateCommerceProxyBaseUrl(state, action.payload);
      })
      .addCase(updateAnalyticsConfiguration, (state, action) => {
        handleUpdateAnalyticsConfiguration(state, action.payload);
      })
      .addCase(updateCommerceAnalyticsConfiguration, (state, action) => {
        handleUpdateCommerceAnalyticsConfiguration(state, action.payload);
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
  if (!isNullOrUndefined(payload.accessToken)) {
    state.accessToken = payload.accessToken;
  }

  state.environment = payload.environment ?? 'prod';

  if (!isNullOrUndefined(payload.organizationId)) {
    state.organizationId = payload.organizationId;
  }

  if (
    !isNullOrUndefined(payload.organizationId) ||
    !isNullOrUndefined(payload.environment)
  ) {
    const organizationId = payload.organizationId ?? state.organizationId;
    const environment = payload.environment ?? state.environment;

    state.platformUrl = getDefaultOrganizationEndpointBaseUrl(
      organizationId,
      'platform',
      environment
    );

    if (
      state.search.apiBaseUrl.length === 0 ||
      matchCoveoOrganizationEndpointUrlAnyOrganization(state.search.apiBaseUrl)
    ) {
      state.search.apiBaseUrl = getDefaultSearchEndpointBaseUrl(
        organizationId,
        environment
      );
    }

    if (
      state.analytics.apiBaseUrl.length === 0 ||
      matchCoveoOrganizationEndpointUrlAnyOrganization(
        state.analytics.apiBaseUrl
      )
    ) {
      state.analytics.apiBaseUrl = getDefaultOrganizationEndpointBaseUrl(
        organizationId,
        'analytics',
        environment
      );
    }

    if (
      state.analytics.nextApiBaseUrl.length === 0 ||
      matchCoveoOrganizationEndpointUrlAnyOrganization(
        state.analytics.nextApiBaseUrl
      )
    ) {
      state.analytics.nextApiBaseUrl = getDefaultAnalyticsNextEndpointBaseUrl(
        organizationId,
        environment
      );
    }
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

function handleUpdateCommerceProxyBaseUrl(
  state: ConfigurationState,
  payload: UpdateProxyBaseUrlPayload
) {
  if (!isNullOrUndefined(payload.proxyBaseUrl)) {
    state.commerce.apiBaseUrl = payload.proxyBaseUrl;
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
    state.analytics.nextApiBaseUrl = payload.proxyBaseUrl;
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
  const magicCookie = getMagicCookie();
  if (magicCookie) {
    state.analytics.analyticsMode = 'next';
    state.analytics.trackingId = magicCookie;
  }
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

function handleUpdateCommerceAnalyticsConfiguration(
  state: ConfigurationState,
  payload: UpdateCommerceAnalyticsConfigurationPayload
) {
  if (!isNullOrUndefined(payload.enabled)) {
    state.analytics.enabled = payload.enabled;
  }
  if (!isNullOrUndefined(payload.proxyBaseUrl)) {
    state.analytics.nextApiBaseUrl = payload.proxyBaseUrl;
  }
  if (!isNullOrUndefined(payload.source)) {
    state.analytics.source = payload.source;
  }
  if (!isNullOrUndefined(payload.trackingId)) {
    state.analytics.trackingId = payload.trackingId;
  }
}
