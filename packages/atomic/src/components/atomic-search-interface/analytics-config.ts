import {
  AnalyticsConfiguration,
  SearchEngineConfiguration,
} from '@coveo/headless';
import {AnalyticsClientSendEventHook} from '@coveo/headless/node_modules/coveo.analytics';
import {getAtomicEnvironment} from '../../global/environment';

type AnalyticsPayload = Parameters<AnalyticsClientSendEventHook>[1];

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
  payload: AnalyticsPayload,
  existingMiddleware?: AnalyticsConfiguration['analyticsClientMiddleware']
) {
  const out = existingMiddleware ? existingMiddleware(event, payload) : payload;
  if (out.customData) {
    out.customData.coveoAtomicVersion = getAtomicEnvironment().version;
  }
  return out;
}
