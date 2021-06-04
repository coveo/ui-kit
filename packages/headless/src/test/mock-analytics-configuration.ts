import {AnalyticsConfiguration} from '../features/configuration/configuration-state';

export function buildMockAnalyticsConfiguration(
  config: Partial<AnalyticsConfiguration> = {}
): AnalyticsConfiguration {
  return {
    apiBaseUrl: '',
    enabled: false,
    originLevel2: '',
    originLevel3: '',
    ...config,
  };
}
