import {createRelay} from '@coveo/relay';
import {
  CoveoSearchPageClient,
  SearchPageClientProvider,
  AnalyticsClientSendEventHook,
} from 'coveo.analytics';
import {SearchEventRequest} from 'coveo.analytics/dist/definitions/events';
import {Logger} from 'pino';
import {
  buildFacetStateMetadata,
  getStateNeededForFacetMetadata,
} from '../../features/facets/facet-set/facet-set-analytics-actions-utils';
import {FacetSortCriterion} from '../../features/facets/facet-set/interfaces/request';
import {RangeFacetSortCriterion} from '../../features/facets/range-facets/generic/interfaces/request';
import {getQueryInitialState} from '../../features/query/query-state';
import {getSearchInitialState} from '../../features/search/search-state';
import {SearchAppState} from '../../state/search-app-state';
import {ConfigurationSection} from '../../state/state-sections';
import {PreprocessRequest} from '../preprocess-request';
import {BaseAnalyticsProvider} from './base-analytics';
import {
  historyStore,
  wrapAnalyticsClientSendEventHook,
  wrapPreprocessRequest,
} from './coveo-analytics-utils';

export type StateNeededBySearchAnalyticsProvider = ConfigurationSection &
  Partial<Omit<SearchAppState, 'configuration'>>;

export class SearchAnalyticsProvider
  extends BaseAnalyticsProvider<StateNeededBySearchAnalyticsProvider>
  implements SearchPageClientProvider
{
  private static fallbackPipelineName = 'default';

  public getFacetState() {
    return buildFacetStateMetadata(
      getStateNeededForFacetMetadata(this.getState())
    );
  }

  public getPipeline() {
    return (
      this.state.pipeline ||
      this.state.search?.response.pipeline ||
      SearchAnalyticsProvider.fallbackPipelineName
    );
  }

  public getSearchEventRequestPayload(): Omit<
    SearchEventRequest,
    'actionCause' | 'searchQueryUid'
  > {
    return {
      queryText: this.queryText,
      responseTime: this.responseTime,
      results: this.resultURIs,
      numberOfResults: this.numberOfResults,
    };
  }

  public getSearchUID(): string {
    const newState = this.getState();
    return (
      newState.search?.searchResponseId ||
      newState.search?.response.searchUid ||
      getSearchInitialState().response.searchUid
    );
  }

  public getSplitTestRunName(): string | undefined {
    return this.state.search?.response.splitTestRun;
  }

  public getSplitTestRunVersion(): string | undefined {
    const hasSplitTestRun = !!this.getSplitTestRunName();
    const effectivePipelineWithSplitTestRun =
      this.state.search?.response.pipeline ||
      this.state.pipeline ||
      SearchAnalyticsProvider.fallbackPipelineName;

    return hasSplitTestRun ? effectivePipelineWithSplitTestRun : undefined;
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

  public getFacetMetadata(facetId: string, facetValue: string) {
    const facetRequest = this.getFacetRequest(facetId);
    const facetField = facetRequest?.field ?? '';
    return {
      ...this.getBaseMetadata(),
      facetId,
      facetField,
      facetValue,
      facetTitle: `${facetField}_${facetId}`,
    };
  }

  public getFacetSortMetadata(
    facetId: string,
    facetSortCriterion: FacetSortCriterion | RangeFacetSortCriterion
  ) {
    const facetRequest = this.getFacetRequest(facetId);
    const facetField = facetRequest?.field ?? '';
    return {
      ...this.getBaseMetadata(),
      facetId,
      facetField,
      criteria: facetSortCriterion,
      facetTitle: `${facetField}_${facetId}`,
    };
  }

  private getFacetRequest = (facetId: string) => {
    return (
      this.state.facetSet?.[facetId]?.request ||
      this.state.categoryFacetSet?.[facetId]?.request ||
      this.state.dateFacetSet?.[facetId]?.request ||
      this.state.numericFacetSet?.[facetId]?.request ||
      this.state.automaticFacetSet?.set[facetId]?.response
    );
  };

  public getGeneratedAnswerMetadata() {
    const state = this.getState();
    const formattedObject: Record<string, string | boolean> = {};
    if (state.generatedAnswer?.isVisible !== undefined) {
      formattedObject['showGeneratedAnswer'] = state.generatedAnswer.isVisible;
    }
    return formattedObject;
  }

  private get resultURIs() {
    return this.results?.map((r) => ({
      documentUri: r.uri,
      documentUriHash: r.raw.urihash,
    }));
  }

  protected get results() {
    return this.state.search?.response.results;
  }

  protected get queryText() {
    return this.state.query?.q || getQueryInitialState().q;
  }

  protected get responseTime() {
    return this.state.search?.duration || getSearchInitialState().duration;
  }

  protected get numberOfResults() {
    return (
      this.state.search?.response.totalCountFiltered ||
      getSearchInitialState().response.totalCountFiltered
    );
  }
}

interface LegacyConfigureAnalyticsOptions {
  logger: Logger;
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  preprocessRequest?: PreprocessRequest;
  provider?: SearchPageClientProvider;
  getState(): StateNeededBySearchAnalyticsProvider;
}

export const configureAnalytics = (
  state: StateNeededBySearchAnalyticsProvider
) => {
  const token = state.configuration.accessToken;
  const trackingId = state.configuration.analytics.trackingId;
  const {emit} = createRelay({
    url: state.configuration.analytics.nextApiBaseUrl,
    token,
    trackingId,
  });
  return emit;
};

export const configureLegacyAnalytics = ({
  logger,
  getState,
  analyticsClientMiddleware = (_, p) => p,
  preprocessRequest,
  provider = new SearchAnalyticsProvider(getState),
}: LegacyConfigureAnalyticsOptions) => {
  const state = getState();
  const token = state.configuration.accessToken;
  const endpoint = state.configuration.analytics.apiBaseUrl;
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
