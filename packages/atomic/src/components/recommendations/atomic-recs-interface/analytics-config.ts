import {
  AnalyticsConfiguration,
  RecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {
  AnalyticsPayload,
  augmentAnalyticsWithAtomicVersion,
  augmentWithExternalMiddleware,
  augmentAnalyticsConfigWithDocument,
  augmentAnalyticsConfigWithAtomicVersion,
  getNextAnalyticsConfig,
} from '../../common/interface/analytics-config';

export function getAnalyticsConfig(
  recsConfig: RecommendationEngineConfiguration,
  enabled: boolean
): AnalyticsConfiguration {
  switch (recsConfig.analytics?.analyticsMode) {
    case 'next':
      return getNextAnalyticsConfig(recsConfig, enabled);
    case 'legacy':
    default:
      return getLegacyAnalyticsConfig(recsConfig, enabled);
  }
}

function getLegacyAnalyticsConfig(
  recsConfig: RecommendationEngineConfiguration,
  enabled: boolean
): AnalyticsConfiguration {
  const analyticsClientMiddleware = (
    event: string,
    payload: AnalyticsPayload
  ) => augmentAnalytics(event, payload, recsConfig);

  const defaultAnalyticsConfig: AnalyticsConfiguration = {
    analyticsClientMiddleware,
    enabled,
    ...augmentAnalyticsConfigWithDocument(),
    ...augmentAnalyticsConfigWithAtomicVersion(),
  };

  if (recsConfig.analytics) {
    return {
      ...defaultAnalyticsConfig,
      ...recsConfig.analytics,
      analyticsClientMiddleware,
    };
  }
  return defaultAnalyticsConfig;
}

function augmentAnalytics(
  event: string,
  payload: AnalyticsPayload,
  recsConfig: RecommendationEngineConfiguration
) {
  let result = augmentWithExternalMiddleware(event, payload, recsConfig);
  result = augmentAnalyticsWithAtomicVersion(result);
  return result;
}
