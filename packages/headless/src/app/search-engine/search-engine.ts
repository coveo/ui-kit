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
import {NoopPreprocessRequestMiddleware} from '../../api/platform-client';
import {debug, pipeline, search, searchHub} from '../reducers';
import {StateFromReducersMapObject} from 'redux';
import {updateSearchConfiguration} from '../../features/configuration/configuration-actions';
import {
  SearchEngineConfiguration,
  searchEngineConfigurationSchema,
  getSampleSearchEngineConfiguration,
} from './search-engine-configuration';
import {executeSearch} from '../../features/search/search-actions';
import {logInterfaceLoad} from '../../features/analytics/analytics-actions';
import {firstSearchExecutedSelector} from '../../features/search/search-selectors';
import {SearchAppState} from '../../state/search-app-state';
import {SearchThunkExtraArguments} from '../headless-engine';

export {SearchEngineConfiguration, getSampleSearchEngineConfiguration};

const searchEngineReducers = {debug, pipeline, searchHub, search};
type SearchEngineReducers = typeof searchEngineReducers;
type SearchEngineState = StateFromReducersMapObject<SearchEngineReducers> &
  Partial<SearchAppState>;

export interface SearchEngine
  extends CoreEngine<SearchEngineState, SearchThunkExtraArguments> {
  executeFirstSearch(): void;
}

export interface SearchEngineOptions
  extends ExternalEngineOptions<SearchEngineState> {
  /**
   * The search engine configuration options.
   */
  configuration: SearchEngineConfiguration;
}

export function buildSearchEngine(options: SearchEngineOptions): SearchEngine {
  const logger = buildLogger(options.loggerOptions);
  validateConfiguration(options.configuration, logger);

  const ref = {
    renewAccessToken: () => Promise.resolve(''),
  };

  const searchAPIClient = createSearchAPIClient(
    options.configuration,
    logger,
    ref
  );

  const thunkArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    searchAPIClient,
  };

  const augmentedOptions: EngineOptions<SearchEngineReducers> = {
    ...options,
    reducers: searchEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);
  ref.renewAccessToken = engine.renewAccessToken;

  const {search} = options.configuration;

  if (search) {
    engine.dispatch(updateSearchConfiguration(search));
  }

  return {
    ...engine,

    get state() {
      return engine.state;
    },

    executeFirstSearch() {
      const firstSearchExecuted = firstSearchExecutedSelector(engine.state);

      if (firstSearchExecuted) {
        return;
      }

      const action = executeSearch(logInterfaceLoad());
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
    logger.error(error, 'Search engine configuration error');
    throw error;
  }
}

function createSearchAPIClient(
  configuration: SearchEngineConfiguration,
  logger: Logger,
  ref: {renewAccessToken: () => Promise<string>}
) {
  const {search} = configuration;
  return new SearchAPIClient({
    logger,
    renewAccessToken: () => ref.renewAccessToken(),
    preprocessRequest: configuration.preprocessRequest || NoopPreprocessRequest,
    deprecatedPreprocessRequest: NoopPreprocessRequestMiddleware,
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
