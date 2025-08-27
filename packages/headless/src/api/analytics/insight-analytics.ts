import {
  type AnalyticsClientSendEventHook,
  CoveoInsightClient,
  type InsightClientProvider,
} from 'coveo.analytics';
import type {SearchEventRequest} from 'coveo.analytics/dist/definitions/events.js';
import type {Logger} from 'pino';
import {
  buildFacetStateMetadata,
  getStateNeededForFacetMetadata,
  type SectionNeededForFacetMetadata,
} from '../../features/facets/facet-set/facet-set-analytics-actions-utils.js';
import {generativeQuestionAnsweringIdSelector} from '../../features/generated-answer/generated-answer-selectors.js';
import {getQueryInitialState} from '../../features/query/query-state.js';
import {getSearchInitialState} from '../../features/search/search-state.js';
import type {InsightAppState} from '../../state/insight-app-state.js';
import type {
  ConfigurationSection,
  GeneratedAnswerSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
  SearchSection,
  TriggerSection,
} from '../../state/state-sections.js';
import {getOrganizationEndpoint} from '../platform-client.js';
import type {PreprocessRequest} from '../preprocess-request.js';
import {BaseAnalyticsProvider} from './base-analytics.js';
import {
  wrapAnalyticsClientSendEventHook,
  wrapPreprocessRequest,
} from './coveo-analytics-utils.js';

export type StateNeededByInsightAnalyticsProvider = ConfigurationSection &
  Partial<InsightAppState> &
  Partial<
    SearchHubSection &
      SearchSection &
      PipelineSection &
      QuerySection &
      TriggerSection &
      SectionNeededForFacetMetadata &
      GeneratedAnswerSection
  >;

export class InsightAnalyticsProvider
  extends BaseAnalyticsProvider<StateNeededByInsightAnalyticsProvider>
  implements InsightClientProvider
{
  public getSearchUID(): string {
    const newState = this.getState();
    return (
      newState.search?.searchResponseId ||
      newState.search?.response.searchUid ||
      getSearchInitialState().response.searchUid
    );
  }
  public getPipeline(): string {
    return (
      this.state.pipeline || this.state.search?.response.pipeline || 'default'
    );
  }
  public getSearchEventRequestPayload(): Omit<
    SearchEventRequest,
    'actionCause' | 'searchQueryUid'
  > {
    return {
      queryText: this.queryText,
      responseTime: this.responseTime,
      results: this.mapResultsToAnalyticsDocument(),
      numberOfResults: this.numberOfResults,
    };
  }

  public getFacetState() {
    return buildFacetStateMetadata(getStateNeededForFacetMetadata(this.state));
  }

  public getBaseMetadata() {
    const state = this.getState();
    const baseObject = super.getBaseMetadata();
    const generativeQuestionAnsweringId =
      generativeQuestionAnsweringIdSelector(state);

    if (generativeQuestionAnsweringId) {
      baseObject.generativeQuestionAnsweringId = generativeQuestionAnsweringId;
    }

    return baseObject;
  }

  public getGeneratedAnswerMetadata() {
    const state = this.getState();
    return {
      ...(state.generatedAnswer?.isVisible !== undefined && {
        showGeneratedAnswer: state.generatedAnswer.isVisible,
      }),
    };
  }

  private get queryText() {
    return this.state.query?.q || getQueryInitialState().q;
  }

  private get responseTime() {
    return this.state.search?.duration || getSearchInitialState().duration;
  }

  private mapResultsToAnalyticsDocument() {
    return this.state.search?.response.results.map((r) => ({
      documentUri: r.uri,
      documentUriHash: r.raw.urihash,
    }));
  }

  private get numberOfResults() {
    return (
      this.state.search?.response.results.length ||
      getSearchInitialState().response.results.length
    );
  }
}

interface ConfigureInsightAnalyticsOptions {
  logger: Logger;
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  preprocessRequest?: PreprocessRequest;
  provider?: InsightClientProvider;
  getState(): StateNeededByInsightAnalyticsProvider;
}

export const configureInsightAnalytics = ({
  logger,
  getState,
  analyticsClientMiddleware = (_, p) => p,
  preprocessRequest,
  provider = new InsightAnalyticsProvider(getState),
}: ConfigureInsightAnalyticsOptions) => {
  const state = getState();
  const token = state.configuration.accessToken;
  const apiBaseUrl =
    state.configuration.analytics.apiBaseUrl ??
    getOrganizationEndpoint(
      state.configuration.organizationId,
      state.configuration.environment,
      'analytics'
    );
  const runtimeEnvironment = state.configuration.analytics.runtimeEnvironment;
  const enabled = state.configuration.analytics.enabled;

  const client = new CoveoInsightClient(
    {
      enableAnalytics: enabled,
      token,
      endpoint: apiBaseUrl,
      runtimeEnvironment,
      preprocessRequest: wrapPreprocessRequest(logger, preprocessRequest),
      beforeSendHooks: [
        wrapAnalyticsClientSendEventHook(logger, analyticsClientMiddleware),
        (type, payload) => {
          logger.info(
            {
              ...payload,
              type,
              endpoint: apiBaseUrl,
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

  if (!enabled) {
    client.disable();
  }

  return client;
};
