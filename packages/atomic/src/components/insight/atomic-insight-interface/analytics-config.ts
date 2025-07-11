import type {
  AnalyticsConfiguration as InsightAnalyticsConfiguration,
  EngineConfiguration as InsightEngineConfiguration,
} from '@coveo/headless/insight';
import {
  type AnalyticsPayload,
  augmentAnalyticsWithAtomicVersion,
  augmentWithExternalMiddleware,
  getNextAnalyticsConfig,
} from '../../common/interface/analytics-config';

export function getAnalyticsConfig(
  searchEngineConfig: InsightEngineConfiguration,
  enabled: boolean
): InsightAnalyticsConfiguration {
  switch (searchEngineConfig.analytics?.analyticsMode) {
    case 'next':
      return getNextAnalyticsConfig(searchEngineConfig, enabled);
    default:
      return getLegacyAnalyticsConfig(searchEngineConfig, enabled);
  }
}

function getLegacyAnalyticsConfig(
  searchEngineConfig: InsightEngineConfiguration,
  enabled: boolean
): InsightAnalyticsConfiguration {
  const analyticsClientMiddleware = (
    event: string,
    payload: AnalyticsPayload
  ) => augmentAnalytics(event, payload, searchEngineConfig);

  const defaultConfiguration: InsightAnalyticsConfiguration = {
    analyticsClientMiddleware,
    enabled,
    documentLocation: document.location.href,
    ...(document.referrer && {originLevel3: document.referrer}),
  };

  if (searchEngineConfig.analytics) {
    return {
      ...defaultConfiguration,
      ...searchEngineConfig.analytics,
      analyticsClientMiddleware,
    };
  }
  return defaultConfiguration;
}

function augmentAnalytics(
  event: string,
  payload: AnalyticsPayload,
  config: InsightEngineConfiguration
) {
  let result = augmentWithExternalMiddleware(event, payload, config);
  result = augmentAnalyticsWithAtomicVersion(result);
  return result;
}
