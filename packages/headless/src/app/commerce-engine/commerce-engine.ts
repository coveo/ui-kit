import {StateFromReducersMapObject, combineReducers} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {CommerceAPIClient} from '../../api/commerce/commerce-api-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {cartReducer} from '../../features/commerce/context/cart/cart-slice';
import {contextReducer} from '../../features/commerce/context/context-slice';
import {commerceFacetSetReducer} from '../../features/commerce/facets/facet-set/facet-set-slice';
import {paginationReducer} from '../../features/commerce/pagination/pagination-slice';
import {productListingV2Reducer} from '../../features/commerce/product-listing/product-listing-slice';
import {queryReducer} from '../../features/commerce/query/query-slice';
import {commerceSearchReducer} from '../../features/commerce/search/search-slice';
import {sortReducer} from '../../features/commerce/sort/sort-slice';
import {facetOrderReducer} from '../../features/facets/facet-order/facet-order-slice';
import {CommerceAppState, CommerceRoutableState} from '../../state/commerce-app-state';
import {CommerceThunkExtraArguments} from '../commerce-thunk-extra-arguments';
import {
  buildEngine,
  CoreEngine,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {buildLogger} from '../logger';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  CommerceEngineConfiguration,
  commerceEngineConfigurationSchema,
} from './commerce-engine-configuration';

export type {CommerceEngineConfiguration};

const commerceRoutableReducers = {
  productListing: productListingV2Reducer,
  commerceSearch: commerceSearchReducer,
  commercePagination: paginationReducer,
  commerceSort: sortReducer,
  facetOrder: facetOrderReducer,
  commerceFacetSet: commerceFacetSetReducer,
  commerceQuery: queryReducer,
  cart: cartReducer,
}

type CommerceEngineRoutableReducers = typeof commerceRoutableReducers;

const commerceEngineReducers = {
  commerceContext: contextReducer,
};
type CommerceEngineReducers = typeof commerceEngineReducers;

export type Routed<T> = Record<string, T>;

type RoutedCommerceEngineState = Routed<StateFromReducersMapObject<CommerceEngineRoutableReducers> & Partial<CommerceRoutableState>>;

type CommerceEngineState = StateFromReducersMapObject<CommerceEngineReducers> &
  Partial<CommerceAppState> & RoutedCommerceEngineState;

/**
 * The engine for powering commerce experiences.
 *
 * @internal WORK IN PROGRESS. DO NOT USE IN ACTUAL IMPLEMENTATIONS.
 */
export interface CommerceEngine<State extends object = {}>
  extends CoreEngine<
    State & CommerceEngineState,
    CommerceThunkExtraArguments
  > {
  registerRoute(id: string): () => void;
}

/**
 * The commerce engine options.
 *
 * @internal WORK IN PROGRESS. DO NOT USE IN ACTUAL IMPLEMENTATIONS.
 */
export interface CommerceEngineOptions
  extends ExternalEngineOptions<CommerceEngineState> {
  /**
   * The commerce engine configuration options.
   */
  configuration: CommerceEngineConfiguration;
}

/**
 * Creates a commerce engine instance.
 *
 * @param options - The commerce engine options.
 * @returns A commerce engine instance.
 * @internal WORK IN PROGRESS. DO NOT USE IN ACTUAL IMPLEMENTATIONS.
 */
export function buildCommerceEngine(
  options: CommerceEngineOptions
): CommerceEngine {
  const logger = buildLogger(options.loggerOptions);
  validateConfiguration(options.configuration, logger);

  const commerceClient = createCommerceAPIClient(options.configuration, logger);

  const thunkArguments: CommerceThunkExtraArguments = {
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

    // As routes are registered/deregistered, their reducers are added/removed from the engine.
    registerRoute(id: string) {
      const reducers = {
        [id]: combineReducers(commerceRoutableReducers)
      }
      engine.addReducers(reducers)

      return () => engine.removeReducers(reducers)
    },

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
    logger.error('Commerce engine configuration error', error);
    throw error;
  }
}

function createCommerceAPIClient(
  configuration: CommerceEngineConfiguration,
  logger: Logger
) {
  return new CommerceAPIClient({
    logger,
    preprocessRequest: configuration.preprocessRequest || NoopPreprocessRequest,
  });
}
