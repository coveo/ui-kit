import {createRelay} from '@coveo/relay';
import {createSelector} from '@reduxjs/toolkit';
import type {NavigatorContextProvider} from '../../app/navigator-context-provider.js';
import type {
  CommerceConfigurationSection,
  ConfigurationSection,
} from '../../state/state-sections.js';
import {getAnalyticsNextApiBaseUrl} from '../platform-client.js';
import {getAnalyticsSource} from './analytics-selectors.js';

type StateNeededByRelay = ConfigurationSection | CommerceConfigurationSection;

export const getRelayInstanceFromState = createSelector(
  (state: StateNeededByRelay) => state.configuration.organizationId,
  (state: StateNeededByRelay) => state.configuration.environment,
  (state: StateNeededByRelay) => state.configuration.accessToken,
  (state: StateNeededByRelay) => state.configuration.analytics,
  (state: StateNeededByRelay) =>
    getAnalyticsSource(state.configuration.analytics),
  (
    _state: StateNeededByRelay,
    navigatorContextProvider?: NavigatorContextProvider
  ) => getEnvironment(navigatorContextProvider),
  (
    organizationId,
    platformEnvironment,
    token,
    {trackingId, apiBaseUrl, enabled},
    source,
    environment
  ) =>
    createRelay({
      mode: enabled ? 'emit' : 'disabled',
      url:
        apiBaseUrl ??
        getAnalyticsNextApiBaseUrl(organizationId, platformEnvironment),
      token,
      trackingId: trackingId ?? null,
      source,
      environment,
    })
);

const getEnvironment = (customProvider?: NavigatorContextProvider) => {
  if (!customProvider) {
    return undefined;
  }

  const customContext = customProvider();

  return {
    getLocation: () => customContext.location,
    getReferrer: () => customContext.referrer,
    getUserAgent: () => customContext.userAgent,
    generateUUID: () => customContext.clientId,
  };
};
