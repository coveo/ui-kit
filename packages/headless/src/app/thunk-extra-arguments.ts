import {AnalyticsClientSendEventHook} from 'coveo.analytics';
import {Logger} from 'pino';
import {PreprocessRequest} from '../api/preprocess-request';
import {validatePayloadAndThrow} from '../utils/validate-payload';
import {EngineConfiguration} from './engine-configuration-options';
import {NoopPreprocessRequest} from '../api/preprocess-request';

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
  const NoopAnalyticsMiddleware = (_: string, p: any) => p;
  return analytics?.analyticsClientMiddleware || NoopAnalyticsMiddleware;
}

function getPreprocessRequest(configuration: EngineConfiguration) {
  return configuration.preprocessRequest || NoopPreprocessRequest;
}
