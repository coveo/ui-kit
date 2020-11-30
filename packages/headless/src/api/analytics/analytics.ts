import {
  CoveoSearchPageClient,
  SearchPageClientProvider,
  history,
  CoveoAnalyticsClient,
  AnalyticsClientSendEventHook,
} from 'coveo.analytics';
import {Logger} from 'pino';
import {getPipelineInitialState} from '../../features/pipeline/pipeline-state';
import {getQueryInitialState} from '../../features/query/query-state';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state';
import {getSearchInitialState} from '../../features/search/search-state';
import {
  ConfigurationSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
  SearchSection,
} from '../../state/state-sections';

export type StateNeededByAnalyticsProvider = ConfigurationSection &
  Partial<SearchHubSection & SearchSection & PipelineSection & QuerySection>;

export class AnalyticsProvider implements SearchPageClientProvider {
  constructor(private state: StateNeededByAnalyticsProvider) {}

  public getSearchEventRequestPayload() {
    return {
      queryText: this.queryText,
      responseTime: this.responseTime,
      results: this.mapResultsToAnalyticsDocument(),
      numberOfResults: this.numberOfResults,
    };
  }

  public getBaseMetadata() {
    return {};
  }

  public getSearchUID() {
    return (
      this.state.search?.response.searchUid ||
      getSearchInitialState().response.searchUid
    );
  }

  public getPipeline() {
    return this.state.pipeline || getPipelineInitialState();
  }

  public getOriginLevel1() {
    return this.state.searchHub || getSearchHubInitialState();
  }

  public getOriginLevel2() {
    // TODO: When tab implemented;
    // Configurable on headless engine, optionally
    // Need to use tabs as originLevel2, in priority if they exists/available.
    // Otherwise, use configured originLevel2 on the engine.
    // Ultimate fallback should be `default`;
    return this.state.configuration.analytics.originLevel2 || 'default';
  }

  public getOriginLevel3() {
    // TODO: When referrer implemented;
    // Configurable on headless engine, optionally
    // If not specified at config time, need to fallback to use current referrer parameter for search API, if any
    // Otherwise: fallback to `default`;
    return this.state.configuration.analytics.originLevel3 || 'default';
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

export const configureAnalytics = (
  state: StateNeededByAnalyticsProvider,
  logger: Logger,
  analyticsClientMiddleware: AnalyticsClientSendEventHook = (_, p) => p,
  provider: SearchPageClientProvider = new AnalyticsProvider(state)
) => {
  const token = state.configuration.accessToken;
  const endpoint = state.configuration.analytics.apiBaseUrl;
  const client = new CoveoSearchPageClient(
    {
      token,
      endpoint,
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

  if (state.configuration.analytics.enabled === false) {
    client.disable();
  }
  return client;
};

export const getVisitorID = () => new CoveoAnalyticsClient({}).currentVisitorId;

export const historyStore = new history.HistoryStore();
