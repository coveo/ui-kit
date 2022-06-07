import {
  CoveoSearchPageClient,
  SearchPageClientProvider,
  history,
  CoveoAnalyticsClient,
  AnalyticsClientSendEventHook,
} from 'coveo.analytics';
import {Logger} from 'pino';
import {getQueryInitialState} from '../../features/query/query-state';
import {getSearchInitialState} from '../../features/search/search-state';
import {
  ConfigurationSection,
  ContextSection,
  FacetSection,
  InsightCaseContextSection,
  InsightConfigurationSection,
  InsightSearchSection,
  PaginationSection,
  PipelineSection,
  ProductListingSection,
  QuerySection,
  RecommendationSection,
  SearchHubSection,
  SearchSection,
} from '../../state/state-sections';
import {PreprocessRequest} from '../preprocess-request';
import {BaseAnalyticsProvider} from './base-analytics';
import {
  buildFacetStateMetadata,
  SectionNeededForFacetMetadata,
  getStateNeededForFacetMetadata,
} from '../../features/facets/facet-set/facet-set-analytics-actions-utils';
import {SearchEventRequest} from 'coveo.analytics/dist/definitions/events';

export type StateNeededBySearchAnalyticsProvider = ConfigurationSection &
  Partial<
    SearchHubSection &
      SearchSection &
      PipelineSection &
      QuerySection &
      ContextSection &
      RecommendationSection &
      ProductListingSection &
      SectionNeededForFacetMetadata
  >;

export class SearchAnalyticsProvider
  extends BaseAnalyticsProvider
  implements SearchPageClientProvider
{
  constructor(private state: StateNeededBySearchAnalyticsProvider) {
    super(state);
  }

export type StateNeededByInsightAnalytics = ConfigurationSection &
  InsightConfigurationSection &
  Partial<
    InsightCaseContextSection &
      InsightSearchSection &
      QuerySection &
      FacetSection &
      PaginationSection
  >;

  public getFacetState() {
    return buildFacetStateMetadata(getStateNeededForFacetMetadata(this.state));
  }

  public getPipeline() {
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

  public getSearchUID(): string {
    return (
      this.state.search?.searchResponseId ||
      this.state.search?.response.searchUid ||
      getSearchInitialState().response.searchUid
    );
  }

  private mapResultsToAnalyticsDocument() {
    return this.state.search?.response.results.map((r) => ({
      documentUri: r.uri,
      documentUriHash: r.raw.urihash,
    }));
  }

  private get queryText() {
    return this.state.query?.q || getQueryInitialState().q;
  }

  private get responseTime() {
    return this.state.search?.duration || getSearchInitialState().duration;
  }

  private get numberOfResults() {
    return (
      this.state.search?.response.results.length ||
      getSearchInitialState().response.results.length
    );
  }
}

interface ConfigureAnalyticsOptions {
  state: StateNeededBySearchAnalyticsProvider;
  logger: Logger;
  analyticsClientMiddleware?: AnalyticsClientSendEventHook;
  preprocessRequest?: PreprocessRequest;
  provider?: SearchPageClientProvider;
}

export const configureAnalytics = ({
  logger,
  state,
  analyticsClientMiddleware = (_, p) => p,
  preprocessRequest,
  provider = new SearchAnalyticsProvider(state),
}: ConfigureAnalyticsOptions) => {
  const token = state.configuration.accessToken;
  const endpoint = state.configuration.analytics.apiBaseUrl;
  const runtimeEnvironment = state.configuration.analytics.runtimeEnvironment;
  const enableAnalytics = state.configuration.analytics.enabled;
  const client = new CoveoSearchPageClient(
    {
      token,
      endpoint,
      runtimeEnvironment,
      preprocessRequest,
      beforeSendHooks: [
        analyticsClientMiddleware,
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

export const getVisitorID = () =>
  new CoveoAnalyticsClient({}).getCurrentVisitorId();

export const historyStore = new history.HistoryStore();

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
