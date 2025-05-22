import {
  AnalyticsConfiguration,
  CommerceEngineConfiguration,
} from '@coveo/headless/commerce';

export function getAnalyticsConfig(
  commerceEngineConfig: CommerceEngineConfiguration,
  enabled: boolean
): AnalyticsConfiguration {
  return {
    enabled,
    ...commerceEngineConfig.analytics,
  };
}
