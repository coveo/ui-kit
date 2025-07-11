import {isNullOrUndefined} from '@coveo/bueno';
import type {StateFromReducersMapObject} from '@reduxjs/toolkit';
import type {Logger} from 'pino';
import {NoopPreprocessRequest} from '../../api/preprocess-request.js';
import {SearchAPIClient} from '../../api/search/search-api-client.js';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware.js';
import {updateSearchConfiguration} from '../../features/configuration/configuration-actions.js';
import {debugReducer as debug} from '../../features/debug/debug-slice.js';
import {setPipeline} from '../../features/pipeline/pipeline-actions.js';
import {pipelineReducer as pipeline} from '../../features/pipeline/pipeline-slice.js';
import {recommendationReducer as recommendation} from '../../features/recommendation/recommendation-slice.js';
import {setSearchHub} from '../../features/search-hub/search-hub-actions.js';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice.js';
import type {RecommendationAppState} from '../../state/recommendation-app-state.js';
import {
  buildEngine,
  type CoreEngine,
  type EngineOptions,
  type ExternalEngineOptions,
} from '../engine.js';
import {buildLogger} from '../logger.js';
import type {SearchThunkExtraArguments} from '../search-thunk-extra-arguments.js';
import {buildThunkExtraArguments} from '../thunk-extra-arguments.js';
import {
  getSampleRecommendationEngineConfiguration,
  type RecommendationEngineConfiguration,
  recommendationEngineConfigurationSchema,
} from './recommendation-engine-configuration.js';

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
 *
 * @group Engine
 */
export interface RecommendationEngine<State extends object = {}>
  extends CoreEngine<
    State & RecommendationEngineState,
    SearchThunkExtraArguments
  > {}

/**
 * The recommendation engine options.
 *
 * @group Engine
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
 *
 * @group Engine
 */
export function buildRecommendationEngine(
  options: RecommendationEngineOptions
): RecommendationEngine {
  const logger = buildLogger(options.loggerOptions);
  validateConfiguration(options.configuration, logger);

  const searchAPIClient = createSearchAPIClient(options.configuration, logger);

  const thunkArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: searchAPIClient,
  };

  const augmentedOptions: EngineOptions<RecommendationEngineReducers> = {
    ...options,
    reducers: recommendationEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const {pipeline, searchHub, timezone, locale, proxyBaseUrl} =
    options.configuration;

  engine.dispatch(updateSearchConfiguration({timezone, locale, proxyBaseUrl}));

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
      configuration.preprocessSearchResponseMiddleware ||
      NoopPostprocessSearchResponseMiddleware,
    postprocessFacetSearchResponseMiddleware:
      NoopPostprocessFacetSearchResponseMiddleware,
    postprocessQuerySuggestResponseMiddleware:
      NoopPostprocessQuerySuggestResponseMiddleware,
  });
}
