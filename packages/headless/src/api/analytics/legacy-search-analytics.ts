import {
  CoveoSearchPageClient,
  SearchPageClientProvider,
  AnalyticsClientSendEventHook,
} from 'coveo.analytics';
import {Logger} from 'pino';
import {getOrganizationEndpoint} from '../platform-client.js';
import {PreprocessRequest} from '../preprocess-request.js';
import {
  historyStore,
  wrapAnalyticsClientSendEventHook,
  wrapPreprocessRequest,
} from './coveo-analytics-utils.js';
import {
  SearchAnalyticsProvider,
  StateNeededBySearchAnalyticsProvider,
} from './search-analytics.js';

interface LegacyConfigureAnalyticsOptions {
  logger: Logger;
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  preprocessRequest?: PreprocessRequest;
  provider?: SearchPageClientProvider;
  getState(): StateNeededBySearchAnalyticsProvider;
}

export const configureLegacyAnalytics = ({
  logger,
  getState,
  analyticsClientMiddleware = (_, p) => p,
  preprocessRequest,
  provider = new SearchAnalyticsProvider(getState),
}: LegacyConfigureAnalyticsOptions) => {
  const state = getState();
  const token = state.configuration.accessToken;
  const endpoint =
    state.configuration.analytics.apiBaseUrl ??
    getOrganizationEndpoint(
      state.configuration.organizationId,
      state.configuration.environment,
      'analytics'
    );
  const runtimeEnvironment = state.configuration.analytics.runtimeEnvironment;
  const enableAnalytics = state.configuration.analytics.enabled;
  const client = new CoveoSearchPageClient(
    {
      token,
      endpoint,
      runtimeEnvironment,
      preprocessRequest: wrapPreprocessRequest(logger, preprocessRequest),
      beforeSendHooks: [
        wrapAnalyticsClientSendEventHook(logger, analyticsClientMiddleware),
        (type, payload) => {
          logger.info(
            {
              ...payload,
              type,
              endpoint,
              token,
            },
            'Analytics request'
          );
          return payload;
        },
      ],
    },
    provider
  );

  if (!enableAnalytics) {
    client.disable();
  }
  return client;
};

export const getPageID = () => {
  const actions = historyStore.getHistory();
  const lastPageView = actions.reverse().find((action) => {
    return action.name === 'PageView' && action.value;
  });

  if (!lastPageView) {
    return '';
  }

  return lastPageView.value!;
};
