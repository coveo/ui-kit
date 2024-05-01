import {createRelay} from '@coveo/relay';
import {createSelector} from '@reduxjs/toolkit';
import {getAnalyticsSource} from './analytics-selectors';
import {StateNeededBySearchAnalyticsProvider} from './search-analytics';

export const getRelayInstanceFromState = createSelector(
  (state: StateNeededBySearchAnalyticsProvider) =>
    state.configuration.accessToken,
  (state: StateNeededBySearchAnalyticsProvider) =>
    state.configuration.analytics,
  (state: StateNeededBySearchAnalyticsProvider) =>
    getAnalyticsSource(state.configuration.analytics),
  (token, {trackingId, nextApiBaseUrl, enabled}, source) =>
    createRelay({
      mode: enabled ? 'emit' : 'disabled',
      url: nextApiBaseUrl,
      token,
      trackingId,
      source: source,
    })
);
