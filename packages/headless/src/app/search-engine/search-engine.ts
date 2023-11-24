import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {SearchAnalyticsProvider} from '../../api/analytics/search-analytics';
import {GeneratedAnswerAPIClient} from '../../api/generated-answer/generated-answer-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {
  logInterfaceLoad,
  logOmniboxFromLink,
  logSearchFromLink,
} from '../../features/analytics/analytics-actions';
import {SearchAction} from '../../features/analytics/analytics-utils';
import {SearchPageEvents} from '../../features/analytics/search-action-cause';
import {
  updateSearchConfiguration,
  UpdateSearchConfigurationActionCreatorPayload,
} from '../../features/configuration/configuration-actions';
import {debugReducer as debug} from '../../features/debug/debug-slice';
import {pipelineReducer as pipeline} from '../../features/pipeline/pipeline-slice';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice';
import {
  StateNeededByExecuteSearch,
  executeSearch,
} from '../../features/search/search-actions';
import {firstSearchExecutedSelector} from '../../features/search/search-selectors';
import {searchReducer as search} from '../../features/search/search-slice';
import {SearchState} from '../../features/search/search-state';
import {StandaloneSearchBoxAnalytics} from '../../features/standalone-search-box-set/standalone-search-box-set-state';
import {SearchAppState} from '../../state/search-app-state';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {buildLogger} from '../logger';
import {SearchThunkExtraArguments} from '../search-thunk-extra-arguments';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {jwtReducer} from './jwt-reducer';
import {
  SearchEngineConfiguration,
  SearchConfigurationOptions,
  searchEngineConfigurationSchema,
  getSampleSearchEngineConfiguration,
} from './search-engine-configuration';

export type {SearchEngineConfiguration, SearchConfigurationOptions};
export {getSampleSearchEngineConfiguration};

const searchEngineReducers = {debug, pipeline, searchHub, search};
type SearchEngineReducers = typeof searchEngineReducers;
type SearchEngineState = StateFromReducersMapObject<SearchEngineReducers> &
  Partial<SearchAppState>;

function getUpdateSearchConfigurationPayload(
  options: SearchEngineOptions
): UpdateSearchConfigurationActionCreatorPayload {
  const search = options.configuration.search;
  const apiBaseUrl =
    options.configuration.organizationEndpoints?.search || undefined;

  const payloadWithURL = {
    ...search,
    apiBaseUrl,
  };

  return payloadWithURL;
}

/**
 * The engine for powering search experiences.
 */
export interface SearchEngine<State extends object = {}>
  extends CoreEngine<State & SearchEngineState, SearchThunkExtraArguments> {
  /**
   * Executes the first search.
   *
   * @param analyticsEvent - The analytics event to log in association with the first search. If unspecified, `logInterfaceLoad` will be used.
   */
  executeFirstSearch(analyticsEvent?: SearchAction): void;

  /**
   * Executes the first search, and logs the analytics event that triggered a redirection from a standalone search box.
   *
   * @param analytics - The standalone search box analytics data.
   */
  executeFirstSearchAfterStandaloneSearchBoxRedirect(
    analytics: StandaloneSearchBoxAnalytics
  ): void;
}

/**
 * The search engine options.
 */
export interface SearchEngineOptions
  extends ExternalEngineOptions<SearchEngineState> {
  /**
   * The search engine configuration options.
   */
  configuration: SearchEngineConfiguration;
}

/**
 * Creates a search engine instance.
 *
 * @param options - The search engine options.
 * @returns A search engine instance.
 */
export function buildSearchEngine(options: SearchEngineOptions): SearchEngine {
  const logger = buildLogger(options.loggerOptions);
  validateConfiguration(options.configuration, logger);

  const searchAPIClient = createSearchAPIClient(options.configuration, logger);
  const generatedAnswerClient = createGeneratedAnswerAPIClient(logger);

  const thunkArguments: SearchThunkExtraArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: searchAPIClient,
    streamingClient: generatedAnswerClient,
  };

  const augmentedOptions: EngineOptions<SearchEngineReducers> = {
    ...options,
    reducers: searchEngineReducers,
    crossReducer: jwtReducer(logger),
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const search = getUpdateSearchConfigurationPayload(options);

  if (search) {
    engine.dispatch(updateSearchConfiguration(search));
  }

  return {
    ...engine,

    get state() {
      return engine.state;
    },

    executeFirstSearch(analyticsEvent = logInterfaceLoad()) {
      const getEventExtraPayload = (state: StateNeededByExecuteSearch) =>
        new SearchAnalyticsProvider(() => state).getBaseMetadata();
      executeSearchAction(
        analyticsEvent,
        engine,
        SearchPageEvents.interfaceLoad,
        getEventExtraPayload
      );
    },

    executeFirstSearchAfterStandaloneSearchBoxRedirect(
      analytics: StandaloneSearchBoxAnalytics
    ) {
      const {cause, metadata} = analytics;
      const isOmnibox = metadata && cause === 'omniboxFromLink';
      const event = isOmnibox
        ? logOmniboxFromLink(metadata)
        : logSearchFromLink();
      const actionCause = isOmnibox
        ? SearchPageEvents.omniboxFromLink
        : SearchPageEvents.searchFromLink;

      const getEventExtraPayload = isOmnibox
        ? (state: StateNeededByExecuteSearch) =>
            new SearchAnalyticsProvider(() => state).getOmniboxFromLinkMetadata(
              metadata
            )
        : (state: StateNeededByExecuteSearch) =>
            new SearchAnalyticsProvider(() => state).getBaseMetadata();
      executeSearchAction(event, engine, actionCause, getEventExtraPayload);
    },
  };
}

// jesus this type, it's a monster, need to fix
function executeSearchAction(
  analyticsEvent: SearchAction,
  engine: CoreEngine<
    {debug: boolean; pipeline: string; searchHub: string; search: SearchState},
    SearchThunkExtraArguments
  >,
  actionCause: SearchPageEvents,
  getEventExtraPayload:
    | ((state: StateNeededByExecuteSearch) => {
        suggestionRanking: number;
        partialQueries: string | string[];
        suggestions: string | string[];
        partialQuery: string;
        querySuggestResponseId: string;
      })
    | ((state: StateNeededByExecuteSearch) => Record<string, string | string[]>)
) {
  const firstSearchExecuted = firstSearchExecutedSelector(engine.state);

  if (firstSearchExecuted) {
    return;
  }

  const action = executeSearch({
    legacy: analyticsEvent,
    next: {
      actionCause,
      getEventExtraPayload,
    },
  });
  engine.dispatch(action);
}

function validateConfiguration(
  configuration: SearchEngineConfiguration,
  logger: Logger
) {
  try {
    searchEngineConfigurationSchema.validate(configuration);
  } catch (error) {
    logger.error(error as Error, 'Search engine configuration error');
    throw error;
  }
}

function createSearchAPIClient(
  configuration: SearchEngineConfiguration,
  logger: Logger
) {
  const {search} = configuration;
  return new SearchAPIClient({
    logger,
    preprocessRequest: configuration.preprocessRequest || NoopPreprocessRequest,
    postprocessSearchResponseMiddleware:
      search?.preprocessSearchResponseMiddleware ||
      NoopPostprocessSearchResponseMiddleware,
    postprocessFacetSearchResponseMiddleware:
      search?.preprocessFacetSearchResponseMiddleware ||
      NoopPostprocessFacetSearchResponseMiddleware,
    postprocessQuerySuggestResponseMiddleware:
      search?.preprocessQuerySuggestResponseMiddleware ||
      NoopPostprocessQuerySuggestResponseMiddleware,
  });
}

function createGeneratedAnswerAPIClient(logger: Logger) {
  return new GeneratedAnswerAPIClient({
    logger,
  });
}
