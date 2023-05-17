import {isNullOrUndefined} from '@coveo/bueno';
import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {updateSearchConfiguration} from '../../features/configuration/configuration-actions';
import {debugReducer as debug} from '../../features/debug/debug-slice';
import {setPipeline} from '../../features/pipeline/pipeline-actions';
import {pipelineReducer as pipeline} from '../../features/pipeline/pipeline-slice';
import {recommendationReducer as recommendation} from '../../features/recommendation/recommendation-slice';
import {setSearchHub} from '../../features/search-hub/search-hub-actions';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice';
import {RecommendationAppState} from '../../state/recommendation-app-state';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {buildLogger} from '../logger';
import {SearchThunkExtraArguments} from '../search-thunk-extra-arguments';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  RecommendationEngineConfiguration,
  recommendationEngineConfigurationSchema,
  getSampleRecommendationEngineConfiguration,
} from './recommendation-engine-configuration';

export type {RecommendationEngineConfiguration};
export {getSampleRecommendationEngineConfiguration};

const recommendationEngineReducers = {
  debug,
  pipeline,
  searchHub,
  recommendation,
};
type RecommendationEngineReducers = typeof recommendationEngineReducers;
type RecommendationEngineState =
  StateFromReducersMapObject<RecommendationEngineReducers> &
    Partial<RecommendationAppState>;

/**
 * The engine for powering recommendation experiences.
 */
export interface RecommendationEngine<State extends object = {}>
  extends CoreEngine<
    State & RecommendationEngineState,
    SearchThunkExtraArguments
  > {}

/**
 * The recommendation engine options.
 */
export interface RecommendationEngineOptions
  extends ExternalEngineOptions<RecommendationEngineState> {
  /**
   * The recommendation engine configuration options.
   */
  configuration: RecommendationEngineConfiguration;
}

/**
 * Creates a recommendation engine instance.
 *
 * @param options - The recommendation engine options.
 * @returns A recommendation engine instance.
 */
export function buildRecommendationEngine(
  options: RecommendationEngineOptions
): RecommendationEngine {
  const logger = buildLogger(options.loggerOptions);
  validateConfiguration(options.configuration, logger);

  const searchAPIClient = createSearchAPIClient(options.configuration, logger);

  const thunkArguments: SearchThunkExtraArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: searchAPIClient,
  };

  const augmentedOptions: EngineOptions<RecommendationEngineReducers> = {
    ...options,
    reducers: recommendationEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const {pipeline, searchHub, timezone, locale} = options.configuration;

  engine.dispatch(updateSearchConfiguration({timezone, locale}));

  if (!isNullOrUndefined(pipeline)) {
    engine.dispatch(setPipeline(pipeline));
  }

  if (!isNullOrUndefined(searchHub)) {
    engine.dispatch(setSearchHub(searchHub));
  }

  return {
    ...engine,

    get state() {
      return engine.state;
    },
  };
}

function validateConfiguration(
  configuration: RecommendationEngineConfiguration,
  logger: Logger
) {
  try {
    recommendationEngineConfigurationSchema.validate(configuration);
  } catch (error) {
    logger.error(error as Error, 'Recommendation engine configuration error');
    throw error;
  }
}

function createSearchAPIClient(
  configuration: RecommendationEngineConfiguration,
  logger: Logger
) {
  return new SearchAPIClient({
    logger,
    preprocessRequest: configuration.preprocessRequest || NoopPreprocessRequest,
    postprocessSearchResponseMiddleware:
      NoopPostprocessSearchResponseMiddleware,
    postprocessFacetSearchResponseMiddleware:
      NoopPostprocessFacetSearchResponseMiddleware,
    postprocessQuerySuggestResponseMiddleware:
      NoopPostprocessQuerySuggestResponseMiddleware,
  });
}
