import {
  AnalyticsClientSendEventHook,
  CaseAssistClient,
  CaseAssistClientProvider,
} from 'coveo.analytics';
import {Logger} from 'pino';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state.js';
import {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DocumentSuggestionSection,
  SearchHubSection,
} from '../../state/state-sections.js';
import {getOrganizationEndpoint} from '../platform-client.js';
import {PreprocessRequest} from '../preprocess-request.js';
import {
  wrapAnalyticsClientSendEventHook,
  wrapPreprocessRequest,
} from './coveo-analytics-utils.js';

export type StateNeededByCaseAssistAnalytics = ConfigurationSection &
  Partial<CaseAssistConfigurationSection> &
  Partial<SearchHubSection> &
  Partial<CaseFieldSection> &
  Partial<CaseInputSection> &
  Partial<DocumentSuggestionSection>;

export class CaseAssistAnalyticsProvider implements CaseAssistClientProvider {
  private state: StateNeededByCaseAssistAnalytics;
  constructor(getState: () => StateNeededByCaseAssistAnalytics) {
    this.state = getState();
  }

  public getSearchUID() {
    return null as unknown as string;
  }

  public getOriginLevel1() {
    return this.state.searchHub || getSearchHubInitialState();
  }
}

interface ConfigureCaseAssistAnalyticsOptions {
  getState: () => StateNeededByCaseAssistAnalytics;
  logger: Logger;
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  preprocessRequest?: PreprocessRequest;
  provider?: CaseAssistClientProvider;
}

export const configureCaseAssistAnalytics = ({
  logger,
  getState,
  analyticsClientMiddleware = (_, p) => p,
  preprocessRequest,
  provider = new CaseAssistAnalyticsProvider(getState),
}: ConfigureCaseAssistAnalyticsOptions) => {
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
