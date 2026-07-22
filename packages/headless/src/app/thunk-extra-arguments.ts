import type {Relay} from '@coveo/relay';
import type {AnalyticsClientSendEventHook} from 'coveo.analytics';
import type {Logger} from 'pino';
import type {GeneratedAnswerAPIClient} from '../api/generated-answer/generated-answer-client.js';
import {
  NoopPreprocessRequest,
  type PreprocessRequest,
} from '../api/preprocess-request.js';
import {validatePayloadAndThrow} from '../utils/validate-payload.js';
import type {EngineConfiguration} from './engine-configuration.js';
import type {NavigatorContext} from './navigator-context-provider.js';

export interface ClientThunkExtraArguments<
  T,
  K = GeneratedAnswerAPIClient,
> extends ThunkExtraArguments {
  apiClient: T;
  streamingClient?: K;
  relay: Relay;
  navigatorContext: NavigatorContext;
}

export interface ThunkExtraArguments {
  preprocessRequest?: PreprocessRequest;
  analyticsClientMiddleware: AnalyticsClientSendEventHook;
  logger: Logger;
  validatePayload: typeof validatePayloadAndThrow;
  /**
   * Legacy-analytics-only, immutable engine policy. When `true`, browser privacy
   * signals (Do Not Track and Global Privacy Control) are not honored. Sourced from
   * the engine configuration at build time and intentionally kept out of Redux
   * analytics state so it cannot be mutated at runtime.
   */
  disableBrowserPrivacySignals?: boolean;
}

export function buildThunkExtraArguments(
  configuration: EngineConfiguration,
  logger: Logger
): ThunkExtraArguments {
  const analyticsClientMiddleware = getAnalyticsClientMiddleware(configuration);
  const validatePayload = validatePayloadAndThrow;
  const preprocessRequest = getPreprocessRequest(configuration);

  return {
    analyticsClientMiddleware,
    validatePayload,
    preprocessRequest,
    logger,
    disableBrowserPrivacySignals:
      configuration.analytics?.disableBrowserPrivacySignals,
  };
}

function getAnalyticsClientMiddleware(
  configuration: EngineConfiguration
): AnalyticsClientSendEventHook {
  const {analytics} = configuration;
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- required for compatibility
  const NoopAnalyticsMiddleware = (_: string, p: any) => p;
  return analytics?.analyticsClientMiddleware || NoopAnalyticsMiddleware;
}

function getPreprocessRequest(configuration: EngineConfiguration) {
  return configuration.preprocessRequest || NoopPreprocessRequest;
}
