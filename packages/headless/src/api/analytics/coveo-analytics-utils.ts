import {
  AnalyticsClientSendEventHook,
  CoveoAnalyticsClient,
  IRuntimeEnvironment,
  history,
} from 'coveo.analytics';
import {Logger} from 'pino';
import {PreprocessRequest} from '../preprocess-request';

export const getVisitorID = (options: {
  runtimeEnvironment?: IRuntimeEnvironment;
}) => new CoveoAnalyticsClient(options).getCurrentVisitorId();

export const clearAnalyticsClient = (options: {
  runtimeEnvironment?: IRuntimeEnvironment;
}) => {
  const client = new CoveoAnalyticsClient(options);
  client.clear();
  client.deleteHttpOnlyVisitorId();
};

export const historyStore = new history.HistoryStore();

export const wrapPreprocessRequest = (
  logger: Logger,
  preprocessRequest?: PreprocessRequest
) => {
  return typeof preprocessRequest === 'function'
    ? (...args: Parameters<PreprocessRequest>) => {
        try {
          return preprocessRequest.apply(preprocessRequest, args);
        } catch (e) {
          logger.error(
            e as Error,
            'Error in analytics preprocessRequest. Returning original request.'
          );
          return args[0];
        }
      }
    : undefined;
};

export const wrapAnalyticsClientSendEventHook = (
  logger: Logger,
  hook: AnalyticsClientSendEventHook
) => {
  return (...args: Parameters<AnalyticsClientSendEventHook>) => {
    try {
      return hook.apply(hook, args);
    } catch (e) {
      logger.error(
        e as Error,
        'Error in analytics hook. Returning original request.'
      );
      return args[1];
    }
  };
};
