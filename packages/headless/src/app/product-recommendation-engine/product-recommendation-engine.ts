import {Logger} from 'pino';
import {StateFromReducersMapObject} from '@reduxjs/toolkit';
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
import {SearchThunkExtraArguments} from '../search-thunk-extra-arguments';
import {setSearchHub} from '../../features/search-hub/search-hub-actions';

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
export interface ProductRecommendationEngine<State extends object = {}>
  extends CoreEngine<
    State & ProductRecommendationEngineState,
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

  const searchAPIClient = createSearchAPIClient(options.configuration, logger);

  const thunkArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    searchAPIClient,
  };

  const augmentedOptions: EngineOptions<ProductRecommendationEngineReducers> = {
    ...options,
    reducers: productRecommendationEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const {searchHub} = options.configuration;
  if (searchHub) {
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
