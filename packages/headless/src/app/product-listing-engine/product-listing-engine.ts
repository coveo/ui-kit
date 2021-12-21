import {Logger} from 'pino';
import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {buildLogger} from '../logger';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  ProductListingEngineConfiguration,
  productListingEngineConfigurationSchema,
  getSampleProductListingEngineConfiguration,
} from './product-listing-engine-configuration';
import {ProductListingAppState} from '../../state/product-listing-app-state';
import {ProductListingAPIClient} from '../../api/commerce/product-listings/product-listing-api-client';
import {ProductListingThunkExtraArguments} from '../product-listing-thunk-extra-arguments';
import {productListing} from '../reducers';
import {SearchEngineConfiguration} from '../search-engine/search-engine-configuration';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';

export type {ProductListingEngineConfiguration};
export {getSampleProductListingEngineConfiguration};

const productListingEngineReducers = {productListing};
type ProductListingEngineReducers = typeof productListingEngineReducers;
type ProductListingEngineState =
  StateFromReducersMapObject<ProductListingEngineReducers> &
    Partial<ProductListingAppState>;

/**
 * The engine for powering production listing experiences.
 */
export interface ProductListingEngine<State extends object = {}>
  extends CoreEngine<
    State & ProductListingEngineState,
    ProductListingThunkExtraArguments,
    ProductListingAPIClient
  > {}

/**
 * The product listing engine options.
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

  const thunkArguments: ProductListingThunkExtraArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: productListingClient,
  };

  const augmentedOptions: EngineOptions<ProductListingEngineReducers> = {
    ...options,
    reducers: productListingEngineReducers,
  };

  const engine = buildEngine<
    ProductListingEngineReducers,
    ProductListingThunkExtraArguments,
    ProductListingAPIClient
  >(augmentedOptions, thunkArguments);

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
