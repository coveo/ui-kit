import {SearchEngineConfiguration} from '@coveo/headless';
import {AnalyticsClientSendEventHook} from '@coveo/headless';
import {getAtomicEnvironment} from '../../../global/environment';
import {InsightEngineConfiguration} from '../../insight';

export type AnalyticsPayload = Parameters<AnalyticsClientSendEventHook>[1];

export function augmentWithExternalMiddleware(
  event: string,
  payload: AnalyticsPayload,
  config: InsightEngineConfiguration | SearchEngineConfiguration
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
