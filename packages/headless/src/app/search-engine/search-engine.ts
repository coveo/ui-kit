import {SearchAPIClient} from '../../api/search/search-api-client';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {buildLogger} from '../logger';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {Logger} from 'pino';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {debug, pipeline, search, searchHub} from '../reducers';
import {StateFromReducersMapObject} from 'redux';
import {updateSearchConfiguration} from '../../features/configuration/configuration-actions';
import {
  SearchEngineConfiguration,
  SearchConfigurationOptions,
  searchEngineConfigurationSchema,
  getSampleSearchEngineConfiguration,
} from './search-engine-configuration';
import {executeSearch} from '../../features/search/search-actions';
import {
  logInterfaceLoad,
  logOmniboxFromLink,
  logSearchFromLink,
} from '../../features/analytics/analytics-actions';
import {firstSearchExecutedSelector} from '../../features/search/search-selectors';
import {SearchAppState} from '../../state/search-app-state';
import {SearchThunkExtraArguments} from '../search-thunk-extra-arguments';
import {SearchAction} from '../../features/analytics/analytics-utils';
import {StandaloneSearchBoxAnalytics} from '../../features/standalone-search-box-set/standalone-search-box-set-state';
import {jwtReducer} from './jwt-reducer';
import {buildSamlClient} from '@coveo/auth';
import {Schema, StringValue} from '@coveo/bueno';

export type {SearchEngineConfiguration, SearchConfigurationOptions};
export {getSampleSearchEngineConfiguration};

const searchEngineReducers = {debug, pipeline, searchHub, search};
type SearchEngineReducers = typeof searchEngineReducers;
type SearchEngineState = StateFromReducersMapObject<SearchEngineReducers> &
  Partial<SearchAppState>;

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

  const thunkArguments: SearchThunkExtraArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    searchAPIClient: searchAPIClient,
    apiClient: searchAPIClient,
  };

  const augmentedOptions: EngineOptions<SearchEngineReducers> = {
    ...options,
    reducers: searchEngineReducers,
    crossReducer: jwtReducer(logger),
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const {search} = options.configuration;

  if (search) {
    engine.dispatch(updateSearchConfiguration(search));
  }

  return {
    ...engine,

    get state() {
      return engine.state;
    },

    executeFirstSearch(analyticsEvent = logInterfaceLoad()) {
      const firstSearchExecuted = firstSearchExecutedSelector(engine.state);

      if (firstSearchExecuted) {
        return;
      }

      const action = executeSearch(analyticsEvent);
      engine.dispatch(action);
    },

    executeFirstSearchAfterStandaloneSearchBoxRedirect(
      analytics: StandaloneSearchBoxAnalytics
    ) {
      const {cause, metadata} = analytics;
      const event =
        metadata && cause === 'omniboxFromLink'
          ? logOmniboxFromLink(metadata)
          : logSearchFromLink();

      this.executeFirstSearch(event);
    },
  };
}

export async function buildSearchEngineWithSamlAuthentication(
  options: Omit<SearchEngineOptions, 'configuration'> & {
    configuration: Omit<SearchEngineConfiguration, 'accessToken'> & {
      provider: string;
    };
  }
) {
  validateSAMLConfiguration(
    options.configuration,
    buildLogger(options.loggerOptions)
  );

  const saml = buildSamlClient({
    organizationId: options.configuration.organizationId,
    platformOrigin: options.configuration.platformUrl,
    provider: options.configuration.provider,
  });

  const token = await saml.authenticate();
  return buildSearchEngine({
    ...options,
    configuration: {
      ...options.configuration,
      accessToken: token,
      renewAccessToken: saml.authenticate,
      search: {
        ...options.configuration.search,
        authenticationProviders: [options.configuration.provider],
      },
    },
  });
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

function validateSAMLConfiguration(
  configuration: {provider: string},
  logger: Logger
) {
  try {
    new Schema<{provider: string}>({
      provider: new StringValue({required: true, emptyAllowed: false}),
    }).validate(configuration);
  } catch (error) {
    logger.error(error as Error, 'Search engine SAML configuration error');
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
