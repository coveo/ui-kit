import {combineReducers, Reducer, StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {CommerceAPIClient} from '../../api/commerce/commerce-api-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {cartReducer} from '../../features/commerce/context/cart/cart-slice';
import {contextReducer} from '../../features/commerce/context/context-slice';
import {commerceFacetSetReducer} from '../../features/commerce/facets/facet-set/facet-set-slice';
import {paginationReducer} from '../../features/commerce/pagination/pagination-slice';
import {productListingV2Reducer} from '../../features/commerce/product-listing/product-listing-slice';
import {queryReducer} from '../../features/commerce/query/query-slice';
import {recommendationsReducer} from '../../features/commerce/recommendations/recommendations-slice';
import {commerceSearchReducer} from '../../features/commerce/search/search-slice';
import {sortReducer} from '../../features/commerce/sort/sort-slice';
import {facetOrderReducer} from '../../features/facets/facet-order/facet-order-slice';
import {specificFacetSearchSetReducer} from '../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {CommerceAppState} from '../../state/commerce-app-state';
import {CommerceThunkExtraArguments} from '../commerce-thunk-extra-arguments';
import {
  buildEngine,
  CoreEngine, CoreState, EngineDispatch,
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

const commerceEngineReducers = {
  productListing: productListingV2Reducer,
  recommendations: recommendationsReducer,
  commerceSearch: commerceSearchReducer,
  commercePagination: paginationReducer,
  commerceSort: sortReducer,
  facetOrder: facetOrderReducer,
  facetSearchSet: specificFacetSearchSetReducer,
  commerceFacetSet: commerceFacetSetReducer,
  commerceContext: contextReducer,
  commerceQuery: queryReducer,
  cart: cartReducer,
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
  extends CoreEngine<
    State & CommerceEngineState,
    CommerceThunkExtraArguments
  > {
  setSliceReducers: (slice: string, reducers: Reducer[]) => void;
  dispatchOnSlice: (slice: string) => (action: any) => EngineDispatch<State & CommerceEngineState & CoreState, CommerceThunkExtraArguments>;
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

  const engine = buildEngine(augmentedOptions, thunkArguments);

  return {
    ...engine,

    dispatchOnSlice(slice: string) {
      return (action: any) => {
        return engine.dispatch({
          ...action,
          // Enrich the action with a slice to target the correct reducer
          slice,
        })
      }
    },

    setSliceReducers(slice: string, reducers: Reducer[]) {
      const namespaceReducer = (reducerFunction: Reducer, reducerName: string) => {
        // TODO(nico): Handle any
        return (state: any, action: any) => {
          // This is where we extract the enriched sliced in `dispatchOnSlice`
          const { slice } = action
          const isInitializationCall = state === undefined
          if (slice !== reducerName && !isInitializationCall) return state

          return reducerFunction(state[slice], action)
        }
      }

      const sliceReducer = combineReducers(reducers);

      // TODO(nico): We're adding the reducers to the engine as top-level reducers because it's a bit difficult to get
      //  headless to play nice with nested reducers. We should and CAN revisit this in the future since the top-level
      //  engine state won't be exposed on the commerce engine.
      engine.addReducers({
        [slice]: namespaceReducer(sliceReducer, slice),
      });
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
