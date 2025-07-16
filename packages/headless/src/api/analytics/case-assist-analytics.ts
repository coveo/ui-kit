import {
  type AnalyticsClientSendEventHook,
  CaseAssistClient,
  type CaseAssistClientProvider,
} from 'coveo.analytics';
import type {Logger} from 'pino';
import type {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DocumentSuggestionSection,
  SearchHubSection,
} from '../../state/state-sections.js';
import {getOrganizationEndpoint} from '../platform-client.js';
import type {PreprocessRequest} from '../preprocess-request.js';
import {BaseAnalyticsProvider} from './base-analytics.js';
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

export class CaseAssistAnalyticsProvider
  extends BaseAnalyticsProvider<StateNeededByCaseAssistAnalytics>
  implements CaseAssistClientProvider
{
  public getSearchUID() {
    return this.state.documentSuggestion?.status.lastResponseId ?? '';
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
