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

export interface ClientThunkExtraArguments<T, K = GeneratedAnswerAPIClient>
  extends ThunkExtraArguments {
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
  };
}

function getAnalyticsClientMiddleware(
  configuration: EngineConfiguration
): AnalyticsClientSendEventHook {
  const {analytics} = configuration;
  // biome-ignore lint/suspicious/noExplicitAny: required for compatibility
  const NoopAnalyticsMiddleware = (_: string, p: any) => p;
  return analytics?.analyticsClientMiddleware || NoopAnalyticsMiddleware;
}

function getPreprocessRequest(configuration: EngineConfiguration) {
  return configuration.preprocessRequest || NoopPreprocessRequest;
}
