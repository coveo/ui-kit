import {Logger} from 'pino';
import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {NoopPreprocessRequestMiddleware} from '../../api/platform-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {buildLogger} from '../logger';
import {productRecommendations, searchHub} from '../reducers';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  ProductRecommendationEngineConfiguration,
  productRecommendationEngineConfigurationSchema,
} from './product-recommendation-engine-configuration';
import {SearchThunkExtraArguments} from '../headless-engine';

export {
  ProductRecommendationEngineConfiguration,
  getSampleProductRecommendationEngineConfiguration,
} from './product-recommendation-engine-configuration';

const productRecommendationEngineReducers = {searchHub, productRecommendations};
type ProductRecommendationEngineReducers = typeof productRecommendationEngineReducers;
type ProductRecommendationEngineState = StateFromReducersMapObject<
  ProductRecommendationEngineReducers
> &
  Partial<ProductRecommendationsAppState>;

/**
 * The engine for powering production recommendation experiences.
 */
export interface ProductRecommendationEngine
  extends CoreEngine<
    ProductRecommendationEngineState,
    SearchThunkExtraArguments
  > {}

/**
 * The product recommendation engine options.
 */
export interface ProductRecommendationEngineOptions
  extends ExternalEngineOptions<ProductRecommendationEngineState> {
  /**
   * The product recommendation engine configuration options.
   */
  configuration: ProductRecommendationEngineConfiguration;
}

/**
 * Creates a product recommendation engine instance.
 *
 * @param options - The product recommendation engine options.
 * @returns A product recommendation engine instance.
 */
export function buildProductRecommendationEngine(
  options: ProductRecommendationEngineOptions
): ProductRecommendationEngine {
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

  const augmentedOptions: EngineOptions<ProductRecommendationEngineReducers> = {
    ...options,
    reducers: productRecommendationEngineReducers,
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
  configuration: ProductRecommendationEngineConfiguration,
  logger: Logger
) {
  try {
    productRecommendationEngineConfigurationSchema.validate(configuration);
  } catch (error) {
    logger.error(error, 'Product Recommendation engine configuration error');
    throw error;
  }
}

function createSearchAPIClient(
  configuration: ProductRecommendationEngineConfiguration,
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
