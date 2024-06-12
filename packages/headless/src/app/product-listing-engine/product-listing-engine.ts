import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {ProductListingAPIClient} from '../../api/commerce/product-listings/product-listing-api-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {productListingReducer as productListing} from '../../features/product-listing/product-listing-slice';
import {ProductListingAppState} from '../../state/product-listing-app-state';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {buildLogger} from '../logger';
import {ProductListingThunkExtraArguments} from '../product-listing-thunk-extra-arguments';
import {SearchEngineConfiguration} from '../search-engine/search-engine-configuration';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  ProductListingEngineConfiguration,
  productListingEngineConfigurationSchema,
  getSampleProductListingEngineConfiguration,
} from './product-listing-engine-configuration';

export type {ProductListingEngineConfiguration};
export {getSampleProductListingEngineConfiguration};

const productListingEngineReducers = {productListing};
type ProductListingEngineReducers = typeof productListingEngineReducers;
type ProductListingEngineState =
  StateFromReducersMapObject<ProductListingEngineReducers> &
    Partial<ProductListingAppState>;

/**
 * The engine for powering production listing experiences.
 * @deprecated TBD CAPI-98
 */
export interface ProductListingEngine<State extends object = {}>
  extends CoreEngine<
    State & ProductListingEngineState,
    ProductListingThunkExtraArguments
  > {}

/**
 * The product listing engine options.
 * @deprecated TBD CAPI-98
 */
export interface ProductListingEngineOptions
  extends ExternalEngineOptions<ProductListingEngineState> {
  /**
   * The product listing engine configuration options.
   */
  configuration: ProductListingEngineConfiguration;
}

/**
 * Creates a product listing engine instance.
 * @deprecated TBD CAPI-98
 *
 * @param options - The product listing engine options.
 * @returns A product listing engine instance.
 */
export function buildProductListingEngine(
  options: ProductListingEngineOptions
): ProductListingEngine {
  const logger = buildLogger(options.loggerOptions);
  validateConfiguration(options.configuration, logger);

  const productListingClient = createProductListingClient(
    options.configuration,
    logger,
    createSearchAPIClient(options.configuration, logger)
  );

  const thunkArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: productListingClient,
  };

  const augmentedOptions: EngineOptions<ProductListingEngineReducers> = {
    ...options,
    reducers: productListingEngineReducers,
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
  configuration: ProductListingEngineConfiguration,
  logger: Logger
) {
  try {
    productListingEngineConfigurationSchema.validate(configuration);
  } catch (error) {
    logger.error('Product Listing engine configuration error', error);
    throw error;
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

function createProductListingClient(
  configuration: ProductListingEngineConfiguration,
  logger: Logger,
  searchAPIClient: SearchAPIClient
) {
  return new ProductListingAPIClient(
    {
      logger,
      preprocessRequest:
        configuration.preprocessRequest || NoopPreprocessRequest,
    },
    searchAPIClient
  );
}
