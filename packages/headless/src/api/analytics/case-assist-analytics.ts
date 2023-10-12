import {
  AnalyticsClientSendEventHook,
  CaseAssistClient,
  CaseAssistClientProvider,
} from 'coveo.analytics';
import {Logger} from 'pino';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state.js';
import {
  CaseAssistConfigurationSection,
  ConfigurationSection,
  SearchHubSection,
} from '../../state/state-sections.js';
import {PreprocessRequest} from '../preprocess-request.js';
import {
  wrapAnalyticsClientSendEventHook,
  wrapPreprocessRequest,
} from './coveo-analytics-utils.js';

export type StateNeededByCaseAssistAnalytics = ConfigurationSection &
  Partial<CaseAssistConfigurationSection> &
  Partial<SearchHubSection>;

export class CaseAssistAnalyticsProvider implements CaseAssistClientProvider {
  constructor(private state: StateNeededByCaseAssistAnalytics) {}

  public getOriginLevel1() {
    return this.state.searchHub || getSearchHubInitialState();
  }
}

interface ConfigureCaseAssistAnalyticsOptions {
  state: StateNeededByCaseAssistAnalytics;
  logger: Logger;
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  preprocessRequest?: PreprocessRequest;
  provider?: CaseAssistClientProvider;
}

export const configureCaseAssistAnalytics = ({
  logger,
  state,
  analyticsClientMiddleware = (_, p) => p,
  preprocessRequest,
  provider = new CaseAssistAnalyticsProvider(state),
}: ConfigureCaseAssistAnalyticsOptions) => {
  const token = state.configuration.accessToken;
  const endpoint = state.configuration.analytics.apiBaseUrl;
  const runtimeEnvironment = state.configuration.analytics.runtimeEnvironment;
  const enableAnalytics = state.configuration.analytics.enabled;
  const client = new CaseAssistClient(
    {
      enableAnalytics,
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
