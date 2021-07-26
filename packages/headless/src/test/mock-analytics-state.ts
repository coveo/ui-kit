import {AnalyticsState} from '../features/configuration/configuration-state';

export function buildMockAnalyticsState(
  config: Partial<AnalyticsState> = {}
): AnalyticsState {
  return {
    apiBaseUrl: '',
    enabled: false,
    originLevel2: '',
    originLevel3: '',
    ...config,
  };
}
