import {StateFromReducersMapObject} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {CommerceAPIClient} from '../../api/commerce/commerce-api-client';
import {getOrganizationEndpoints} from '../../api/platform-client';
import {NoopPreprocessRequest} from '../../api/preprocess-request';
import {setItems} from '../../features/commerce/context/cart/cart-actions';
import {cartReducer} from '../../features/commerce/context/cart/cart-slice';
import {setContext} from '../../features/commerce/context/context-actions';
import {contextReducer} from '../../features/commerce/context/context-slice';
import {didYouMeanReducer} from '../../features/commerce/did-you-mean/did-you-mean-slice';
import {commerceFacetSetReducer} from '../../features/commerce/facets/facet-set/facet-set-slice';
import {fieldSuggestionsOrderReducer} from '../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice';
import {manualNumericFacetReducer} from '../../features/commerce/facets/numeric-facet/manual-numeric-facet-slice';
import {paginationReducer} from '../../features/commerce/pagination/pagination-slice';
import {productListingReducer} from '../../features/commerce/product-listing/product-listing-slice';
import {queryReducer} from '../../features/commerce/query/query-slice';
import {recommendationsReducer} from '../../features/commerce/recommendations/recommendations-slice';
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
import {redactEngine, stateKey} from '../state-key';
import {buildThunkExtraArguments} from '../thunk-extra-arguments';
import {
  CommerceEngineConfiguration,
  commerceEngineConfigurationSchema,
} from './commerce-engine-configuration';

export type {CommerceEngineConfiguration};

const commerceEngineReducers = {
  productListing: productListingReducer,
  recommendations: recommendationsReducer,
  commerceSearch: commerceSearchReducer,
  commercePagination: paginationReducer,
  commerceSort: sortReducer,
  facetOrder: facetOrderReducer,
  fieldSuggestionsOrder: fieldSuggestionsOrderReducer,
  facetSearchSet: specificFacetSearchSetReducer,
  categoryFacetSearchSet: categoryFacetSearchSetReducer,
  commerceFacetSet: commerceFacetSetReducer,
  manualNumericFacetSet: manualNumericFacetReducer,
  commerceContext: contextReducer,
  commerceQuery: queryReducer,
  cart: cartReducer,
  didYouMean: didYouMeanReducer,
  triggers: commerceTriggersReducer,
};
type CommerceEngineReducers = typeof commerceEngineReducers;

export type CommerceEngineState =
  StateFromReducersMapObject<CommerceEngineReducers> &
    Partial<CommerceAppState>;

/**
 * The engine for powering commerce experiences.
 */
export interface CommerceEngine<State extends object = {}>
  extends CoreEngineNext<
    State & CommerceEngineState,
    CommerceThunkExtraArguments
  > {}

/**
 * The commerce engine options.
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
    configuration: {
      ...options.configuration,
      organizationEndpoints: {
        ...getOrganizationEndpoints(
          options.configuration.organizationId,
          options.configuration.environment
        ),
        ...options.configuration.organizationEndpoints,
      },
    },
    reducers: commerceEngineReducers,
  };

  const internalEngine = buildEngine(augmentedOptions, thunkArguments);
  const {state: _, ...engine} = internalEngine;

  engine.dispatch(setContext(options.configuration.context));
  if (
    options.configuration.cart !== undefined &&
    options.configuration.cart.items !== undefined
  ) {
    engine.dispatch(setItems(options.configuration.cart.items));
  }

  return redactEngine({
    ...engine,

    get [stateKey]() {
      return internalEngine.state;
    },

    get configuration() {
      return internalEngine.state.configuration;
    },
  });
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
