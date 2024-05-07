import {
  AnalyticsConfiguration,
  CommerceEngineConfiguration,
} from '@coveo/headless/commerce';

export function getAnalyticsConfig(
  commerceEngineConfig: CommerceEngineConfiguration,
  enabled: boolean
): AnalyticsConfiguration {
  const defaultConfiguration: AnalyticsConfiguration = {
    enabled,
    documentLocation: document.location.href,
    ...(document.referrer && {originLevel3: document.referrer}),
    analyticsMode: 'next',
  };

  if (commerceEngineConfig.analytics) {
    return {
      ...defaultConfiguration,
      ...commerceEngineConfig.analytics,
    };
  }
  return defaultConfiguration;
}
