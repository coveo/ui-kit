import {
  buildBrowserEnvironment,
  type CustomEnvironment,
  createRelay,
} from '@coveo/relay';
import {createSelector} from '@reduxjs/toolkit';
import type {NavigatorContextProvider} from '../../app/navigator-context-provider.js';
import type {
  CommerceConfigurationSection,
  ConfigurationSection,
} from '../../state/state-sections.js';
import {isBrowser} from '../../utils/runtime.js';
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
  ) => navigatorContextProvider,
  (
    organizationId,
    platformEnvironment,
    token,
    {trackingId, apiBaseUrl, enabled},
    source,
    navigatorContextProvider
  ) => {
    const environment = getEnvironment(navigatorContextProvider);
    return createRelay({
      mode: enabled ? 'emit' : 'disabled',
      url:
        apiBaseUrl ??
        getAnalyticsNextApiBaseUrl(organizationId, platformEnvironment),
      token,
      trackingId: trackingId ?? null,
      source,
      environment,
    });
  }
);

const noopRelayEnvironment: CustomEnvironment = {
  generateUUID: () => '',
  getLocation: () => null,
  getReferrer: () => null,
  getUserAgent: () => null,
  send: () => {},
  storage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
};

const getEnvironment = (
  customProvider?: NavigatorContextProvider
): CustomEnvironment | undefined => {
  if (!customProvider) {
    return undefined;
  }

  const customContext = customProvider();
  const baseEnvironment = isBrowser()
    ? buildBrowserEnvironment()
    : noopRelayEnvironment;
  return {
    ...baseEnvironment,
    generateUUID: () => customContext.clientId,
    getLocation: () => customContext.location,
    getReferrer: () => customContext.referrer,
    getUserAgent: () => customContext.userAgent,
  };
};
