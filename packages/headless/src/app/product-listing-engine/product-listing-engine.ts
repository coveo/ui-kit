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
} from './product-listing-engine-configuration';
import {ProductListingAppState} from '../../state/product-listing-app-state';
import {ProductListingAPIClient} from '../../api/commerce/product-listings/product-listing-api-client';
import {ProductListingThunkExtraArguments} from '../product-listing-thunk-extra-arguments';
import {productListing} from '../reducers';

export {
  ProductListingEngineConfiguration,
  getSampleProductListingEngineConfiguration,
} from './product-listing-engine-configuration';

const productListingEngineReducers = {productListing};
type ProductListingEngineReducers = typeof productListingEngineReducers;
type ProductListingEngineState = StateFromReducersMapObject<
  ProductListingEngineReducers
> &
  Partial<ProductListingAppState>;

/**
 * The engine for powering production listing experiences.
 */
export interface ProductListingEngine<State extends object = {}>
  extends CoreEngine<
    State & ProductListingEngineState,
    ProductListingThunkExtraArguments
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
    logger
  );

  const thunkArguments: ProductListingThunkExtraArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    productListingClient,
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

function createProductListingClient(
  configuration: ProductListingEngineConfiguration,
  logger: Logger
) {
  return new ProductListingAPIClient({
    logger,
    preprocessRequest: configuration.preprocessRequest || NoopPreprocessRequest,
  });
}
