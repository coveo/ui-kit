import {buildBrowserEnvironment, type CustomEnvironment, createRelay} from '@coveo/relay';
import {createSelectorCreator, lruMemoize} from '@reduxjs/toolkit';
import type {NavigatorContextProvider} from '../../app/navigator-context-provider.js';
import type {
  CommerceConfigurationSection,
  ConfigurationSection,
} from '../../state/state-sections.js';
import {isBrowser} from '../../utils/runtime.js';
import {getAnalyticsNextApiBaseUrl} from '../platform-client.js';
import {getAnalyticsSource} from './analytics-selectors.js';

type StateNeededByRelay = ConfigurationSection | CommerceConfigurationSection;

/**
 * Maximum number of memoized relay instances kept at once.
 *
 * The result cache is keyed (among others) by `accessToken`, a primitive. reselect's default
 * `weakMapMemoize` never evicts primitive keys, so on a server with per-user access tokens the
 * cache would grow without bound. An LRU cache with a fixed size keeps the memoization benefit
 * while capping retention. Sized generously so that concurrent, distinct tokens in flight during a
 * single render pass still hit the cache.
 */
const RELAY_INSTANCE_CACHE_SIZE = 50;

// Only `memoize` (the result cache keyed by the primitive token) is bounded. `argsMemoize` is left
// at its default `weakMapMemoize`, which keys weakly on the argument objects (the full SSR state,
// the navigator context) so they stay garbage-collectable; bounding it with a strong LRU would
// instead retain up to 50 complete state trees.
const createBoundedSelector = createSelectorCreator({
  memoize: lruMemoize,
  memoizeOptions: {maxSize: RELAY_INSTANCE_CACHE_SIZE},
});

export const getRelayInstanceFromState = createBoundedSelector(
  (state: StateNeededByRelay) => state.configuration.organizationId,
  (state: StateNeededByRelay) => state.configuration.environment,
  (state: StateNeededByRelay) => state.configuration.accessToken,
  (state: StateNeededByRelay) => state.configuration.analytics,
  (state: StateNeededByRelay) => getAnalyticsSource(state.configuration.analytics),
  (_state: StateNeededByRelay, navigatorContextProvider?: NavigatorContextProvider) =>
    navigatorContextProvider,
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
      url: apiBaseUrl ?? getAnalyticsNextApiBaseUrl(organizationId, platformEnvironment),
      token,
      trackingId: trackingId ?? null,
      source,
      environment,
    });
  }
);

const noopRelayEnvironment: CustomEnvironment = {
  getClientId: () => '',
  getLocation: () => null,
  getReferrer: () => null,
  getUserAgent: () => null,
  send: async () => {},
};

const getEnvironment = (
  customProvider?: NavigatorContextProvider
): CustomEnvironment | undefined => {
  if (!customProvider) {
    return undefined;
  }

  const customContext = customProvider();
  const baseEnvironment = isBrowser() ? buildBrowserEnvironment() : noopRelayEnvironment;
  return {
    ...baseEnvironment,
    getClientId: () => customContext.clientId,
    getLocation: () => customContext.location,
    getReferrer: () => customContext.referrer,
    getUserAgent: () => customContext.userAgent,
  };
};
