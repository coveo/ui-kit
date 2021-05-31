import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {buildEngine, EngineOptions, ExternalEngineOptions} from '../engine';
import {Engine} from '../headless-engine';
import {RecommendationAppState} from '../../state/recommendation-app-state';
import {debug, pipeline, searchHub} from '../reducers';
import {
  RecommendationEngineConfiguration,
  recommendationEngineConfigurationSchema,
} from './recommendation-engine-configuration';
import {buildLogger} from '../logger';
import {Logger} from 'pino';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {NoopPreprocessRequestMiddleware} from '../../api/platform-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {SearchAPIClient} from '../../api/search/search-api-client';

const recommendationEngineReducers = {debug, pipeline, searchHub};
type RecommendationEngineReducers = typeof recommendationEngineReducers;
type RecommendationEngineState = StateFromReducersMapObject<
  RecommendationEngineReducers
> &
  Partial<RecommendationAppState>;

export interface RecommendationEngine
  extends Engine<RecommendationEngineState> {}

export interface RecommendationEngineOptions
  extends ExternalEngineOptions<RecommendationEngineState> {
  /**
   * The recommendation engine configuration options.
   */
  configuration: RecommendationEngineConfiguration;
}

export function buildRecommendationEngine(
  options: RecommendationEngineOptions
): RecommendationEngine {
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

  const augmentedOptions: EngineOptions<RecommendationEngineReducers> = {
    ...options,
    reducers: recommendationEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);
  ref.renewAccessToken = engine.renewAccessToken;

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
  logger: Logger,
  ref: {renewAccessToken: () => Promise<string>}
) {
  return new SearchAPIClient({
    logger,
    renewAccessToken: () => ref.renewAccessToken(),
    preprocessRequest: configuration.preprocessRequest || NoopPreprocessRequest,
    deprecatedPreprocessRequest: NoopPreprocessRequestMiddleware,
    postprocessSearchResponseMiddleware: NoopPostprocessSearchResponseMiddleware,
    postprocessFacetSearchResponseMiddleware: NoopPostprocessFacetSearchResponseMiddleware,
    postprocessQuerySuggestResponseMiddleware: NoopPostprocessQuerySuggestResponseMiddleware,
  });
}
