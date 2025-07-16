import type {CommerceEngineConfiguration} from '@coveo/headless/commerce';

export function getAnalyticsConfig(
  commerceEngineConfig: CommerceEngineConfiguration,
  enabled: boolean
): CommerceEngineConfiguration['analytics'] {
  return {
    enabled,
    ...commerceEngineConfig.analytics,
  };
}
