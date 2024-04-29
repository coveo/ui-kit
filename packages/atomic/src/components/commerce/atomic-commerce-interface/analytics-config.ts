import {
  AnalyticsConfiguration,
  CommerceEngineConfiguration,
} from '@coveo/headless/commerce';

export function getAnalyticsConfig(
  commerceEngineConfig: CommerceEngineConfiguration,
  enabled: boolean
): AnalyticsConfiguration {
  switch (commerceEngineConfig.analytics?.analyticsMode) {
    default:
      return getNextAnalyticsConfig(commerceEngineConfig, enabled);
  }
}

export function getNextAnalyticsConfig(
  commerceEngineConfig: CommerceEngineConfiguration,
  enabled: boolean
): AnalyticsConfiguration {
  const defaultConfiguration: AnalyticsConfiguration = {
    enabled,
    documentLocation: document.location.href,
    ...(document.referrer && {originLevel3: document.referrer}),
  };

  if (commerceEngineConfig.analytics) {
    return {
      ...defaultConfiguration,
      ...commerceEngineConfig.analytics,
    };
  }
  return defaultConfiguration;
}
