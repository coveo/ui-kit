import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {LegacyGeneratedAnswerAPIClient} from '../../api/generated-answer/generated-answer-client';
import {answerApi} from '../../api/knowledge/stream-answer-api';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {
  interfaceLoad,
  logInterfaceLoad,
  logOmniboxFromLink,
  logSearchFromLink,
  omniboxFromLink,
  searchFromLink,
} from '../../features/analytics/analytics-actions';
import {LegacySearchAction} from '../../features/analytics/analytics-utils';
import {
  updateAnswerConfiguration,
  updateSearchConfiguration,
  UpdateSearchConfigurationActionCreatorPayload,
} from '../../features/configuration/configuration-actions';
import {debugReducer as debug} from '../../features/debug/debug-slice';
import {pipelineReducer as pipeline} from '../../features/pipeline/pipeline-slice';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice';
import {executeSearch} from '../../features/search/search-actions';
import {firstSearchExecutedSelector} from '../../features/search/search-selectors';
import {searchReducer as search} from '../../features/search/search-slice';
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
  executeFirstSearch(analyticsEvent?: LegacySearchAction): void;

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

  const thunkArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: searchAPIClient,
    ...(options.configuration.answerConfigurationId
      ? {}
      : {streamingClient: createLegacyGeneratedAnswerAPIClient(logger)}),
  };

  type EngineOptionsWithAnswerMiddlewares = Omit<
    EngineOptions<SearchEngineReducers>,
    'middlewares'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  > & {middlewares?: any};

  const augmentedOptions: EngineOptionsWithAnswerMiddlewares = {
    ...options,
    reducers: searchEngineReducers,
    crossReducer: jwtReducer(logger),
    ...(options.configuration.answerConfigurationId
      ? {middlewares: [answerApi.middleware]}
      : {}),
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const search = getUpdateSearchConfigurationPayload(options);

  if (search) {
    engine.dispatch(updateSearchConfiguration(search));
  }

  if (options.configuration.answerConfigurationId) {
    engine.dispatch(
      updateAnswerConfiguration({
        answerConfigurationId: options.configuration.answerConfigurationId,
      })
    );
  }

  return {
    ...engine,

    get state() {
      return engine.state;
    },

    executeFirstSearch(analyticsEvent = logInterfaceLoad()) {
      if (firstSearchExecutedSelector(engine.state)) {
        return;
      }

      const action = executeSearch({
        legacy: analyticsEvent,
        next: interfaceLoad(),
      });
      engine.dispatch(action);
    },

    executeFirstSearchAfterStandaloneSearchBoxRedirect(
      analytics: StandaloneSearchBoxAnalytics
    ) {
      const {cause, metadata} = analytics;

      if (firstSearchExecutedSelector(engine.state)) {
        return;
      }

      const isOmniboxFromLink = metadata && cause === 'omniboxFromLink';

      const action = executeSearch({
        legacy: isOmniboxFromLink
          ? logOmniboxFromLink(metadata)
          : logSearchFromLink(),
        next: isOmniboxFromLink ? omniboxFromLink() : searchFromLink(),
      });
      engine.dispatch(action);
    },
  };
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

function createLegacyGeneratedAnswerAPIClient(logger: Logger) {
  return new LegacyGeneratedAnswerAPIClient({
    logger,
  });
}
