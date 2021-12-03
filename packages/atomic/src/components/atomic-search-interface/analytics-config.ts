import {
  AnalyticsConfiguration,
  SearchEngineConfiguration,
} from '@coveo/headless';
import {getAtomicEnvironment} from '../../global/environment';

export function getAnalyticsConfig(
  searchEngineConfig: SearchEngineConfiguration,
  enabled: boolean
): AnalyticsConfiguration {
  if (searchEngineConfig.analytics) {
    return {
      ...searchEngineConfig.analytics,
      enabled,
      analyticsClientMiddleware: (event, payload) =>
        augmentAnalyticsWithAtomicVersion(
          event,
          payload,
          searchEngineConfig.analytics?.analyticsClientMiddleware
        ),
    };
  }

  return {
    enabled,
    analyticsClientMiddleware: augmentAnalyticsWithAtomicVersion,
  };
}

function augmentAnalyticsWithAtomicVersion(
  event: string,
  payload: any,
  existingMiddleware?: AnalyticsConfiguration['analyticsClientMiddleware']
) {
  const out = existingMiddleware ? existingMiddleware(event, payload) : payload;
  if (out.customData) {
    out.customData.coveoAtomicVersion = getAtomicEnvironment().version;
  }
  return out;
}
