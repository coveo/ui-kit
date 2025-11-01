import type {StateFromReducersMapObject} from '@reduxjs/toolkit';
import type {Logger} from 'pino';
import {CommerceAPIClient} from '../../api/commerce/commerce-api-client.js';
import {NoopPreprocessRequest} from '../../api/preprocess-request.js';
import {
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
  updateProxyBaseUrl,
} from '../../features/commerce/configuration/configuration-actions.js';
import {configurationReducer} from '../../features/commerce/configuration/configuration-slice.js';
import type {ConfigurationState} from '../../features/commerce/configuration/configuration-state.js';
import {setItems} from '../../features/commerce/context/cart/cart-actions.js';
import {cartReducer} from '../../features/commerce/context/cart/cart-slice.js';
import {setContext} from '../../features/commerce/context/context-actions.js';
import {contextReducer} from '../../features/commerce/context/context-slice.js';
import {didYouMeanReducer} from '../../features/commerce/did-you-mean/did-you-mean-slice.js';
import {commerceFacetSetReducer} from '../../features/commerce/facets/facet-set/facet-set-slice.js';
import {fieldSuggestionsOrderReducer} from '../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import {manualNumericFacetReducer} from '../../features/commerce/facets/numeric-facet/manual-numeric-facet-slice.js';
import {paginationReducer} from '../../features/commerce/pagination/pagination-slice.js';
import {productListingReducer} from '../../features/commerce/product-listing/product-listing-slice.js';
import {queryReducer} from '../../features/commerce/query/query-slice.js';
import {recommendationsReducer} from '../../features/commerce/recommendations/recommendations-slice.js';
import {commerceSearchReducer} from '../../features/commerce/search/search-slice.js';
import {sortReducer} from '../../features/commerce/sort/sort-slice.js';
import {commerceTriggersReducer} from '../../features/commerce/triggers/triggers-slice.js';
import {versionReducer} from '../../features/debug/version-slice.js';
import {facetOrderReducer} from '../../features/facets/facet-order/facet-order-slice.js';
import {categoryFacetSearchSetReducer} from '../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import {specificFacetSearchSetReducer} from '../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import type {CommerceAppState} from '../../state/commerce-app-state.js';
import type {CommerceThunkExtraArguments} from '../commerce-thunk-extra-arguments.js';
import {
  buildCoreEngine,
  type CoreEngineNext,
  type CoreState,
  type EngineOptions,
  type ExternalEngineOptions,
} from '../engine.js';
import {buildLogger} from '../logger.js';
import {redactEngine, stateKey} from '../state-key.js';
import {buildThunkExtraArguments} from '../thunk-extra-arguments.js';
import {
  type CommerceEngineConfiguration,
  commerceEngineConfigurationSchema,
} from './commerce-engine-configuration.js';

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
 *
 * @group Engine
 */
export interface CommerceEngine<State extends object = {}>
  extends CoreEngineNext<
    State & CoreState<ConfigurationState> & CommerceEngineState,
    CommerceThunkExtraArguments,
    ConfigurationState
  > {}

/**
 * The commerce engine options.
 *
 * @group Engine
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
 *
 * @group Engine
 */
export function buildCommerceEngine(
  options: CommerceEngineOptions
): CommerceEngine {
  const logger = buildLogger(options.loggerOptions);
  const {configuration} = options;
  validateConfiguration(configuration, logger);

  const commerceClient = createCommerceAPIClient(configuration, logger);

  const thunkArguments = {
    ...buildThunkExtraArguments(configuration, logger),
    apiClient: commerceClient,
  };

  const reducers = {
    ...commerceEngineReducers,
    configuration: configurationReducer,
    version: versionReducer,
  };

  const augmentedOptions: EngineOptions<CommerceEngineReducers> = {
    ...options,
    reducers,
  };

  const internalEngine = buildCoreEngine(
    augmentedOptions,
    thunkArguments,
    configurationReducer
  );

  const {state: _, ...engine} = internalEngine;

  const {
    accessToken,
    environment,
    organizationId,
    analytics,
    proxyBaseUrl,
    context,
    cart,
  } = configuration;

  engine.dispatch(
    updateBasicConfiguration({
      accessToken,
      environment,
      organizationId,
    })
  );

  engine.dispatch(updateAnalyticsConfiguration(analytics));

  if (proxyBaseUrl !== undefined) {
    engine.dispatch(
      updateProxyBaseUrl({
        proxyBaseUrl,
      })
    );
  }

  engine.dispatch(setContext(context));

  if (cart?.items !== undefined) {
    engine.dispatch(setItems(cart.items));
  }

  return redactEngine({
    ...engine,

    get relay() {
      return internalEngine.relay;
    },

    get [stateKey]() {
      return internalEngine.state;
    },

    get configuration(): ConfigurationState {
      return {
        ...internalEngine.state.configuration,
      };
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
    logger.error(error, 'Commerce engine configuration error');
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
