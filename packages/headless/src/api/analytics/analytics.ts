import {
  CoveoSearchPageClient,
  SearchPageClientProvider,
  history,
  CoveoAnalyticsClient,
  AnalyticsClientSendEventHook,
  CaseAssistClient,
  CaseAssistClientProvider,
} from 'coveo.analytics';
import {Logger} from 'pino';
import {getQueryInitialState} from '../../features/query/query-state';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state';
import {getSearchInitialState} from '../../features/search/search-state';
import {
  CaseAssistConfigurationSection,
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  ProductListingSection,
  QuerySection,
  RecommendationSection,
  SearchHubSection,
  SearchSection,
} from '../../state/state-sections';
import {PreprocessRequest} from '../preprocess-request';
import {getLanguage} from './shared-analytics';
import {
  buildFacetStateMetadata,
  SectionNeededForFacetMetadata,
  getStateNeededForFacetMetadata,
} from '../../features/facets/facet-set/facet-set-analytics-actions-utils';
import {VERSION} from '../../utils/version';

export type StateNeededByAnalyticsProvider = ConfigurationSection &
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

export type StateNeededByCaseAssistAnalytics = ConfigurationSection &
  Partial<CaseAssistConfigurationSection> &
  Partial<SearchHubSection>;

export class AnalyticsProvider implements SearchPageClientProvider {
  constructor(private state: StateNeededByAnalyticsProvider) {}

  public getLanguage() {
    return getLanguage(this.state);
  }

  public getSearchEventRequestPayload() {
    return {
      queryText: this.queryText,
      responseTime: this.responseTime,
      results: this.mapResultsToAnalyticsDocument(),
      numberOfResults: this.numberOfResults,
    };
  }

  public getBaseMetadata() {
    const {context} = this.state;
    const contextValues = context?.contextValues || {};
    const formattedObject: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(contextValues)) {
      const formattedKey = `context_${key}`;
      formattedObject[formattedKey] = value;
    }
    formattedObject['coveoHeadlessVersion'] = VERSION;
    return formattedObject;
  }

  public getSearchUID() {
    return (
      this.state.search?.searchResponseId ||
      this.state.search?.response.searchUid ||
      this.state.recommendation?.searchUid ||
      this.state.productListing?.responseId ||
      getSearchInitialState().response.searchUid
    );
  }

  public getPipeline() {
    return (
      this.state.pipeline || this.state.search?.response.pipeline || 'default'
    );
  }

  public getOriginContext() {
    return this.state.configuration.analytics.originContext;
  }

  public getOriginLevel1() {
    return this.state.searchHub || getSearchHubInitialState();
  }

  public getOriginLevel2() {
    return this.state.configuration.analytics.originLevel2;
  }

  public getOriginLevel3() {
    // TODO: When referrer implemented;
    // Configurable on headless engine, optionally
    // If not specified at config time, need to fallback to use current referrer parameter for search API, if any
    // Otherwise: fallback to `default`;
    return this.state.configuration.analytics.originLevel3;
  }

  public getFacetState() {
    return buildFacetStateMetadata(getStateNeededForFacetMetadata(this.state));
  }

  public getIsAnonymous() {
    return this.state.configuration.analytics.anonymous;
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

export class CaseAssistAnalyticsProvider implements CaseAssistClientProvider {
  constructor(private state: StateNeededByCaseAssistAnalytics) {}

  public getOriginLevel1() {
    return this.state.searchHub || getSearchHubInitialState();
  }
}

interface ConfigureAnalyticsOptions {
  state: StateNeededByAnalyticsProvider;
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
  provider = new AnalyticsProvider(state),
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
