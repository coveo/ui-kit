import {AnalyticsClientSendEventHook} from 'coveo.analytics';
import {Logger} from 'pino';
import {PreprocessRequest} from '../api/preprocess-request';
import {validatePayloadAndThrow} from '../utils/validate-payload';
import {EngineConfigurationOptions} from './engine-configuration-options';
import {NoopPreprocessRequest} from '../api/preprocess-request';

export interface ThunkExtraArguments {
  preprocessRequest?: PreprocessRequest;
  analyticsClientMiddleware: AnalyticsClientSendEventHook;
  logger: Logger;
  validatePayload: typeof validatePayloadAndThrow;
}

export function buildThunkExtraArguments(
  configuration: EngineConfigurationOptions,
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
  configuration: EngineConfigurationOptions
): AnalyticsClientSendEventHook {
  const {analytics} = configuration;
  const NoopAnalyticsMiddleware = (_: string, p: any) => p;
  return analytics?.analyticsClientMiddleware || NoopAnalyticsMiddleware;
}

function getPreprocessRequest(configuration: EngineConfigurationOptions) {
  return configuration.preprocessRequest || NoopPreprocessRequest;
}
