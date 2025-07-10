import type {StateFromReducersMapObject} from '@reduxjs/toolkit';
import type {Logger} from 'pino';
import {GeneratedAnswerAPIClient} from '../../api/generated-answer/generated-answer-client.js';
import {getSearchApiBaseUrl} from '../../api/platform-client.js';
import {NoopPreprocessRequest} from '../../api/preprocess-request.js';
import {SearchAPIClient} from '../../api/search/search-api-client.js';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware.js';
import {
  interfaceLoad,
  logInterfaceLoad,
  logOmniboxFromLink,
  logSearchFromLink,
  omniboxFromLink,
  searchFromLink,
} from '../../features/analytics/analytics-actions.js';
import type {LegacySearchAction} from '../../features/analytics/analytics-utils.js';
import {
  type UpdateSearchConfigurationActionCreatorPayload,
  updateSearchConfiguration,
} from '../../features/configuration/configuration-actions.js';
import type {ConfigurationState} from '../../features/configuration/configuration-state.js';
import {debugReducer as debug} from '../../features/debug/debug-slice.js';
import {pipelineReducer as pipeline} from '../../features/pipeline/pipeline-slice.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {firstSearchExecutedSelector} from '../../features/search/search-selectors.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice.js';
import type {StandaloneSearchBoxAnalytics} from '../../features/standalone-search-box-set/standalone-search-box-set-state.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import {
  buildEngine,
  type CoreEngine,
  type EngineOptions,
  type ExternalEngineOptions,
} from '../engine.js';
import {buildLogger} from '../logger.js';
import type {SearchThunkExtraArguments} from '../search-thunk-extra-arguments.js';
import {buildThunkExtraArguments} from '../thunk-extra-arguments.js';
import {jwtReducer} from './jwt-reducer.js';
import {
  getSampleSearchEngineConfiguration,
  type SearchConfigurationOptions,
  type SearchEngineConfiguration,
  searchEngineConfigurationSchema,
} from './search-engine-configuration.js';

export type {SearchEngineConfiguration, SearchConfigurationOptions};
export {getSampleSearchEngineConfiguration};

const searchEngineReducers = {debug, pipeline, searchHub, search};
type SearchEngineReducers = typeof searchEngineReducers;
type SearchEngineState = StateFromReducersMapObject<SearchEngineReducers> &
  Partial<SearchAppState>;

function getUpdateSearchConfigurationPayload(
  configuration: SearchEngineConfiguration
): UpdateSearchConfigurationActionCreatorPayload {
  const {search, organizationId, environment} = configuration;
  const apiBaseUrl = search?.proxyBaseUrl
    ? search.proxyBaseUrl
    : getSearchApiBaseUrl(organizationId, environment);

  const payloadWithURL = {
    ...search,
    apiBaseUrl,
  };

  return payloadWithURL;
}

/**
 * The engine for powering search experiences.
 *
 * @group Engine
 */
export interface SearchEngine<State extends object = {}>
  extends CoreEngine<
    State & SearchEngineState,
    SearchThunkExtraArguments,
    ConfigurationState
  > {
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
 *
 * @group Engine
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
 *
 * @group Engine
 */
export function buildSearchEngine(options: SearchEngineOptions): SearchEngine {
  const logger = buildLogger(options.loggerOptions);
  const {configuration} = options;
  validateConfiguration(configuration, logger);

  const searchAPIClient = createSearchAPIClient(configuration, logger);
  const generatedAnswerClient = createGeneratedAnswerAPIClient(logger);

  const thunkArguments = {
    ...buildThunkExtraArguments(configuration, logger),
    apiClient: searchAPIClient,
    streamingClient: generatedAnswerClient,
  };

  const augmentedOptions: EngineOptions<SearchEngineReducers> = {
    ...options,
    reducers: searchEngineReducers,
    crossReducer: jwtReducer(logger),
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const search = getUpdateSearchConfigurationPayload(configuration);

  if (search) {
    engine.dispatch(updateSearchConfiguration(search));
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

function createGeneratedAnswerAPIClient(logger: Logger) {
  return new GeneratedAnswerAPIClient({
    logger,
  });
}
