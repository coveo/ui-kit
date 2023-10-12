import {isNullOrUndefined} from '@coveo/bueno';
import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {NoopPreprocessRequest} from '../../api/preprocess-request.js';
import {SearchAPIClient} from '../../api/search/search-api-client.js';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware.js';
import {updateSearchConfiguration} from '../../features/configuration/configuration-actions.js';
import {productRecommendationsReducer as productRecommendations} from '../../features/product-recommendations/product-recommendations-slice.js';
import {setSearchHub} from '../../features/search-hub/search-hub-actions.js';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice.js';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state.js';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine.js';
import {buildLogger} from '../logger.js';
import {SearchThunkExtraArguments} from '../search-thunk-extra-arguments.js';
import {buildThunkExtraArguments} from '../thunk-extra-arguments.js';
import {
  ProductRecommendationEngineConfiguration,
  productRecommendationEngineConfigurationSchema,
} from './product-recommendation-engine-configuration.js';

export type {ProductRecommendationEngineConfiguration} from './product-recommendation-engine-configuration.js';
export {getSampleProductRecommendationEngineConfiguration} from './product-recommendation-engine-configuration.js';

const productRecommendationEngineReducers = {searchHub, productRecommendations};
type ProductRecommendationEngineReducers =
  typeof productRecommendationEngineReducers;
type ProductRecommendationEngineState =
  StateFromReducersMapObject<ProductRecommendationEngineReducers> &
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

  const thunkArguments: SearchThunkExtraArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: searchAPIClient,
  };

  const augmentedOptions: EngineOptions<ProductRecommendationEngineReducers> = {
    ...options,
    reducers: productRecommendationEngineReducers,
  };

  const engine = buildEngine(augmentedOptions, thunkArguments);

  const {searchHub, timezone, locale} = options.configuration;

  engine.dispatch(updateSearchConfiguration({timezone, locale}));

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
  configuration: ProductRecommendationEngineConfiguration,
  logger: Logger
) {
  try {
    productRecommendationEngineConfigurationSchema.validate(configuration);
  } catch (error) {
    logger.error('Product Recommendation engine configuration error', error);
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
    postprocessSearchResponseMiddleware:
      NoopPostprocessSearchResponseMiddleware,
    postprocessFacetSearchResponseMiddleware:
      NoopPostprocessFacetSearchResponseMiddleware,
    postprocessQuerySuggestResponseMiddleware:
      NoopPostprocessQuerySuggestResponseMiddleware,
  });
}
