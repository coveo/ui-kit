import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {ProductListingV2APIClient} from '../../api/commerce/product-listings/v2/product-listing-v2-api-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {productListingV2Reducer} from '../../features/product-listing/v2/product-listing-v2-slice';
import {ProductListingV2AppState} from '../../state/commerce-app-state';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {buildLogger} from '../logger';
import {ProductListingThunkExtraArguments} from '../product-listing-thunk-extra-arguments';
import {ProductListingV2ThunkExtraArguments} from '../product-listing-v2-thunk-extra-arguments';
import {SearchEngineConfiguration} from '../search-engine/search-engine-configuration';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  CommerceEngineConfiguration,
  commerceEngineConfigurationSchema,
  getSampleCommerceEngineConfiguration,
} from './commerce-engine-configuration';

export type {CommerceEngineConfiguration};
export {getSampleCommerceEngineConfiguration};

const commerceEngineReducers = {productListing: productListingV2Reducer};
type CommerceEngineReducers = typeof commerceEngineReducers;

type CommerceEngineState = StateFromReducersMapObject<CommerceEngineReducers> &
  Partial<ProductListingV2AppState>;

export interface CommerceEngine<State extends object = {}>
  extends CoreEngine<
    State & CommerceEngineState,
    ProductListingThunkExtraArguments
  > {}

export interface CommerceEngineOptions
  extends ExternalEngineOptions<CommerceEngineState> {
  /**
   * The commerce engine configuration options.
   */
  configuration: CommerceEngineConfiguration;
}

export function buildCommerceEngine(
  options: CommerceEngineOptions
): CommerceEngine {
  const logger = buildLogger(options.loggerOptions);
  validateConfiguration(options.configuration, logger);

  const commerceClient = createCommerceAPIClient(
    options.configuration,
    logger,
    createSearchAPIClient(options.configuration, logger)
  );

  const thunkArguments: ProductListingV2ThunkExtraArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: commerceClient,
  };

  const augmentedOptions: EngineOptions<CommerceEngineReducers> = {
    ...options,
    reducers: commerceEngineReducers,
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
  configuration: CommerceEngineConfiguration,
  logger: Logger
) {
  try {
    commerceEngineConfigurationSchema.validate(configuration);
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

function createCommerceAPIClient(
  configuration: CommerceEngineConfiguration,
  logger: Logger,
  searchAPIClient: SearchAPIClient
) {
  return new ProductListingV2APIClient(
    {
      logger,
      preprocessRequest:
        configuration.preprocessRequest || NoopPreprocessRequest,
    },
    searchAPIClient
  );
}
