import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {SearchThunkExtraArguments} from '../search-thunk-extra-arguments';
import {RecommendationAppState} from '../../state/recommendation-app-state';
import {debug, pipeline, recommendation, searchHub} from '../reducers';
import {
  RecommendationEngineConfiguration,
  recommendationEngineConfigurationSchema,
  getSampleRecommendationEngineConfiguration,
} from './recommendation-engine-configuration';
import {buildLogger} from '../logger';
import {Logger} from 'pino';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {SearchAPIClient} from '../../api/search/search-api-client';

export {
  RecommendationEngineConfiguration,
  getSampleRecommendationEngineConfiguration,
};

const recommendationEngineReducers = {
  debug,
  pipeline,
  searchHub,
  recommendation,
};
type RecommendationEngineReducers = typeof recommendationEngineReducers;
type RecommendationEngineState = StateFromReducersMapObject<
  RecommendationEngineReducers
> &
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

  const thunkArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    searchAPIClient,
  };

  const augmentedOptions: EngineOptions<RecommendationEngineReducers> = {
    ...options,
    reducers: recommendationEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

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
    logger.error(error, 'Recommendation engine configuration error');
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
    postprocessSearchResponseMiddleware: NoopPostprocessSearchResponseMiddleware,
    postprocessFacetSearchResponseMiddleware: NoopPostprocessFacetSearchResponseMiddleware,
    postprocessQuerySuggestResponseMiddleware: NoopPostprocessQuerySuggestResponseMiddleware,
  });
}
