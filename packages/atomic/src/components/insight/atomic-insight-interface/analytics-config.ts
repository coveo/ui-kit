import {
  AnalyticsPayload,
  augmentAnalyticsWithAtomicVersion,
  augmentWithExternalMiddleware,
} from '../../common/interface/analytics-config';
import {
  AnalyticsConfiguration,
  InsightEngineConfiguration,
} from '@coveo/headless/insight';

export function getAnalyticsConfig(
  searchEngineConfig: InsightEngineConfiguration,
  enabled: boolean
): AnalyticsConfiguration {
  const analyticsClientMiddleware = (
    event: string,
    payload: AnalyticsPayload
  ) => augmentAnalytics(event, payload, searchEngineConfig);

  const defaultConfiguration: AnalyticsConfiguration = {
    analyticsClientMiddleware,
    enabled,
    documentLocation: document.location.href,
    ...(document.referrer && {originLevel3: document.referrer}),
  };

  if (searchEngineConfig.analytics) {
    return {
      ...defaultConfiguration,
      ...searchEngineConfig.analytics,
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
