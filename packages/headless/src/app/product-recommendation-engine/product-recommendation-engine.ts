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
import {productRecommendationsReducer as productRecommendations} from '../../features/product-recommendations/product-recommendations-slice';
import {setSearchHub} from '../../features/search-hub/search-hub-actions';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
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
  ProductRecommendationEngineConfiguration,
  productRecommendationEngineConfigurationSchema,
} from './product-recommendation-engine-configuration';

export type {ProductRecommendationEngineConfiguration} from './product-recommendation-engine-configuration';
export {getSampleProductRecommendationEngineConfiguration} from './product-recommendation-engine-configuration';

const productRecommendationEngineReducers = {searchHub, productRecommendations};
type ProductRecommendationEngineReducers =
  typeof productRecommendationEngineReducers;
type ProductRecommendationEngineState =
  StateFromReducersMapObject<ProductRecommendationEngineReducers> &
    Partial<ProductRecommendationsAppState>;

/**
 * The engine for powering production recommendation experiences.
 * @deprecated The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
 */
export interface ProductRecommendationEngine<State extends object = {}>
  extends CoreEngine<
    State & ProductRecommendationEngineState,
    SearchThunkExtraArguments
  > {}

/**
 * The product recommendation engine options.
 * @deprecated The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
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
 * @deprecated The `product-recommendation` sub-package is deprecated. Use the `commerce` sub-package instead.
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
