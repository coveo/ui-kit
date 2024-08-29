import {
  AnalyticsClientSendEventHook,
  InsightClientProvider,
  CoveoInsightClient,
} from 'coveo.analytics';
import {SearchEventRequest} from 'coveo.analytics/dist/definitions/events';
import {Logger} from 'pino';
import {
  buildFacetStateMetadata,
  getStateNeededForFacetMetadata,
  SectionNeededForFacetMetadata,
} from '../../features/facets/facet-set/facet-set-analytics-actions-utils';
import {getQueryInitialState} from '../../features/query/query-state';
import {getSearchInitialState} from '../../features/search/search-state';
import {InsightAppState} from '../../state/insight-app-state';
import {
  ConfigurationSection,
  GeneratedAnswerSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
  SearchSection,
  TriggerSection,
} from '../../state/state-sections';
import {PreprocessRequest} from '../preprocess-request';
import {BaseAnalyticsProvider} from './base-analytics';
import {
  wrapAnalyticsClientSendEventHook,
  wrapPreprocessRequest,
} from './coveo-analytics-utils';

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
      state.search?.response?.extendedResults?.generativeQuestionAnsweringId;

    if (generativeQuestionAnsweringId) {
      baseObject['generativeQuestionAnsweringId'] =
        generativeQuestionAnsweringId;
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
  const apiBaseUrl = state.configuration.analytics.apiBaseUrl;
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
