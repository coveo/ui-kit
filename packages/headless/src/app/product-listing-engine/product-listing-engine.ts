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
import {searchHub} from '../reducers';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  ProductListingEngineConfiguration,
  productListingEngineConfigurationSchema,
} from './product-listing-engine-configuration';
import {SearchThunkExtraArguments} from '../search-thunk-extra-arguments';
import {setSearchHub} from '../../features/search-hub/search-hub-actions';
import {isNullOrUndefined} from '@coveo/bueno';
import {updateSearchConfiguration} from '../../features/configuration/configuration-actions';
import {ProductListingAppState} from '../../state/product-listing-app-state';
import {ProductListingAPIClient} from '../../api/commerce/product-listings/product-listing-api-client';

export {
  ProductListingEngineConfiguration,
  getSampleProductListingEngineConfiguration,
} from './product-listing-engine-configuration';

// TODO COM-1185: Add "productListings" reducers here.
const productListingEngineReducers = {searchHub};
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
    SearchThunkExtraArguments
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

  const thunkArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    productListingClient,
  };

  const augmentedOptions: EngineOptions<ProductListingEngineReducers> = {
    ...options,
    reducers: productListingEngineReducers,
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
  configuration: ProductListingEngineConfiguration,
  logger: Logger
) {
  try {
    productListingEngineConfigurationSchema.validate(configuration);
  } catch (error) {
    logger.error(error, 'Product Listing engine configuration error');
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
