import {
  SearchEngineConfiguration,
  AnalyticsConfiguration,
} from '@coveo/headless';
import {AnalyticsClientSendEventHook} from '@coveo/headless';
import {getAtomicEnvironment} from '../../../global/environment';
import {InsightEngineConfiguration} from '../../insight';
import {RecommendationEngineConfiguration} from '../../recommendations';

export type AnalyticsPayload = Parameters<AnalyticsClientSendEventHook>[1];

export function augmentWithExternalMiddleware(
  event: string,
  payload: AnalyticsPayload,
  config:
    | InsightEngineConfiguration
    | SearchEngineConfiguration
    | RecommendationEngineConfiguration
) {
  if (config.analytics?.analyticsClientMiddleware) {
    return config.analytics.analyticsClientMiddleware(event, payload);
  }
  return payload;
}

export function augmentAnalyticsWithAtomicVersion(payload: AnalyticsPayload) {
  if (payload.customData) {
    payload.customData.coveoAtomicVersion = getAtomicEnvironment().version;
  }
  return payload;
}

export function augmentAnalyticsConfigWithDocument(): AnalyticsConfiguration {
  return {
    documentLocation: document.location.href,
    ...(document.referrer && {originLevel3: document.referrer}),
  };
}

const versionMatcher = /^(\d+\.\d+\.\d+)/;

export function augmentAnalyticsConfigWithAtomicVersion(): Required<
  Pick<AnalyticsConfiguration, 'source'>
> {
  return {
    source: {
      '@coveo/atomic':
        versionMatcher.exec(getAtomicEnvironment().version)?.[0] || '0.0.0',
    },
  };
}
