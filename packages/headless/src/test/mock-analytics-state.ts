import {AnalyticsState} from '../features/configuration/configuration-state';

export function buildMockAnalyticsState(
  config: Partial<AnalyticsState> = {}
): AnalyticsState {
  return {
    apiBaseUrl: '',
    nextApiBaseUrl: '',
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
