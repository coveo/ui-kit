import type {AnalyticsState} from '../features/configuration/configuration-state.js';

export function buildMockAnalyticsState(
  config: Partial<AnalyticsState> = {}
): AnalyticsState {
  return {
    apiBaseUrl: '',
    enabled: false,
    originLevel2: '',
    originLevel3: '',
    anonymous: false,
    deviceId: '',
    originContext: '',
    userDisplayName: '',
    documentLocation: '',
    trackingId: '',
    analyticsMode: 'next',
    source: {},
    ...config,
  };
}
