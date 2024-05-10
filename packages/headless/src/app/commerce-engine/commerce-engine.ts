import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {CommerceAPIClient} from '../../api/commerce/commerce-api-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {cartReducer} from '../../features/commerce/context/cart/cart-slice';
import {setContext} from '../../features/commerce/context/context-actions';
import {contextReducer} from '../../features/commerce/context/context-slice';
import {commerceFacetSetReducer} from '../../features/commerce/facets/facet-set/facet-set-slice';
import {paginationReducer} from '../../features/commerce/pagination/pagination-slice';
import {productListingV2Reducer} from '../../features/commerce/product-listing/product-listing-slice';
import {queryReducer} from '../../features/commerce/query/query-slice';
import {recommendationsReducer} from '../../features/commerce/recommendations/recommendations-slice';
import {executeSearch} from '../../features/commerce/search/search-actions';
import {commerceSearchReducer} from '../../features/commerce/search/search-slice';
import {sortReducer} from '../../features/commerce/sort/sort-slice';
import {commerceTriggersReducer} from '../../features/commerce/triggers/triggers-slice';
import {facetOrderReducer} from '../../features/facets/facet-order/facet-order-slice';
import {categoryFacetSearchSetReducer} from '../../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {specificFacetSearchSetReducer} from '../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {CommerceAppState} from '../../state/commerce-app-state';
import {CommerceThunkExtraArguments} from '../commerce-thunk-extra-arguments';
import {
  buildEngine,
  CoreEngineNext,
  EngineOptions,
  ExternalEngineOptions,
} from '../engine';
import {buildLogger} from '../logger';
import {stateKey} from '../state-key';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  CommerceEngineConfiguration,
  commerceEngineConfigurationSchema,
} from './commerce-engine-configuration';

export type {CommerceEngineConfiguration};

const commerceEngineReducers = {
  productListing: productListingV2Reducer,
  recommendations: recommendationsReducer,
  commerceSearch: commerceSearchReducer,
  commercePagination: paginationReducer,
  commerceSort: sortReducer,
  facetOrder: facetOrderReducer,
  facetSearchSet: specificFacetSearchSetReducer,
  categoryFacetSearchSet: categoryFacetSearchSetReducer,
  commerceFacetSet: commerceFacetSetReducer,
  commerceContext: contextReducer,
  commerceQuery: queryReducer,
  cart: cartReducer,
  triggers: commerceTriggersReducer,
};
type CommerceEngineReducers = typeof commerceEngineReducers;

export type CommerceEngineState =
  StateFromReducersMapObject<CommerceEngineReducers> &
    Partial<CommerceAppState>;

/**
 * The engine for powering commerce experiences.
 *
 * @internal WORK IN PROGRESS. DO NOT USE IN ACTUAL IMPLEMENTATIONS.
 */
export interface CommerceEngine<State extends object = {}>
  extends CoreEngineNext<
    State & CommerceEngineState,
    CommerceThunkExtraArguments
  > {
  /**
   * Executes the first search.
   */
  executeFirstSearch(): void;

  /**
   * Executes the first search after a redirection from a standalone search box.
   */
  executeFirstSearchAfterStandaloneSearchBoxRedirect(): void;
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

  const thunkArguments = {
    ...buildThunkExtraArguments(options.configuration, logger),
    apiClient: commerceClient,
  };

  const augmentedOptions: EngineOptions<CommerceEngineReducers> = {
    ...options,
    reducers: commerceEngineReducers,
  };

  const internalEngine = buildEngine(augmentedOptions, thunkArguments);
  const {state: _, ...engine} = internalEngine;

  engine.dispatch(setContext(options.configuration.context));

  return {
    ...engine,

    get [stateKey]() {
      return internalEngine.state;
    },

    get configuration() {
      return internalEngine.state.configuration;
    },

    executeFirstSearch() {
      const action = executeSearch();
      internalEngine.dispatch(action);
    },

    executeFirstSearchAfterStandaloneSearchBoxRedirect() {
      const action = executeSearch();
      internalEngine.dispatch(action);
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
