import {createRelay} from '@coveo/relay';
import {createSelector} from '@reduxjs/toolkit';
import {
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
    organizationId,
    environment,
    token,
    {trackingId, apiBaseUrl, enabled},
    source
  ) =>
    createRelay({
      mode: enabled ? 'emit' : 'disabled',
      url:
        apiBaseUrl ?? getAnalyticsNextApiBaseUrl(organizationId, environment),
      token,
      trackingId,
      source: source,
    })
);
