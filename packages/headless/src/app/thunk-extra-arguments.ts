import {Relay} from '@coveo/relay';
import {AnalyticsClientSendEventHook} from 'coveo.analytics';
import {Logger} from 'pino';
import {GeneratedAnswerAPIClient} from '../api/generated-answer/generated-answer-client.js';
import {PreprocessRequest} from '../api/preprocess-request.js';
import {NoopPreprocessRequest} from '../api/preprocess-request.js';
import {validatePayloadAndThrow} from '../utils/validate-payload.js';
import {EngineConfiguration} from './engine-configuration.js';
import {NavigatorContext} from './navigatorContextProvider.js';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const NoopAnalyticsMiddleware = (_: string, p: any) => p;
  return analytics?.analyticsClientMiddleware || NoopAnalyticsMiddleware;
}

function getPreprocessRequest(configuration: EngineConfiguration) {
  return configuration.preprocessRequest || NoopPreprocessRequest;
}
