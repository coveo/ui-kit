import type {CoreEngineNext} from '../../../../app/engine.js';
import type {
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
} from '../../../../controllers/commerce/core/parameter-manager/headless-core-parameter-manager.js';
import {buildProductListing} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {manualNumericFacetReducer as manualNumericFacetSet} from '../../../../features/commerce/facets/numeric-facet/manual-numeric-facet-slice.js';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice.js';
import type {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import {parametersReducer as commerceParameters} from '../../../../features/commerce/parameters/parameters-slice.js';
import type {ProductListingParameters} from '../../../../features/commerce/product-listing-parameters/product-listing-parameters-actions.js';
import {queryReducer as query} from '../../../../features/commerce/query/query-slice.js';
import type {CommerceSearchParameters} from '../../../../features/commerce/search-parameters/search-parameters-actions.js';
import {sortReducer as commerceSort} from '../../../../features/commerce/sort/sort-slice.js';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice.js';
import {querySetReducer as querySet} from '../../../../features/query-set/query-set-slice.js';
import {ensureAtLeastOneSolutionType} from '../../../../ssr/commerce/controller-utils.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {
  ControllerDefinitionOption,
  SubControllerDefinitionWithProps,
} from '../../types/controller-definitions.js';
import {createControllerWithKind, Kind} from '../../types/kind.js';

export type {
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
  CommerceSearchParameters,
};

/**
 * @deprecated In the future, the parameterManager controller will be included by default in the engine definition. You will no longer need to define it manually
 * Defines a `ParameterManager` controller instance.
 * @group Definers
 *
 * @returns The `ParameterManager` controller definition.
 */
export function defineParameterManager<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    listing: true,
    search: true,
    ...options,
    buildWithProps: (engine, props, solutionType) => {
      if (solutionType === SolutionType.listing) {
        if (!loadCommerceProductListingParameterReducers(engine)) {
          throw loadReducerError;
        }
        const controller = buildProductListing(engine).parameterManager({
          ...props,
          excludeDefaultParameters: true,
        });

        return createControllerWithKind(controller, Kind.ParameterManager);
      } else {
        if (!loadCommerceSearchParameterReducers(engine)) {
          throw loadReducerError;
        }

        const controller = buildSearch(engine).parameterManager({
          ...props,
          excludeDefaultParameters: true,
        });

        return createControllerWithKind(controller, Kind.ParameterManager);
      }
    },
  } as SubControllerDefinitionWithProps<
    ParameterManager<MappedParameterTypes<TOptions>>,
    TOptions,
    SSRParameterManagerProps<MappedParameterTypes<TOptions>>
  >;
}

export interface SSRParameterManagerProps<T extends Parameters>
  extends Omit<ParameterManagerProps<T>, 'excludeDefaultParameters'> {}

type MappedParameterTypes<
  TOptions extends ControllerDefinitionOption | undefined,
> = TOptions extends {listing: true; search: true} | undefined
  ? ProductListingParameters | CommerceSearchParameters
  : TOptions extends {listing: true; search: false}
    ? ProductListingParameters
    : TOptions extends {listing: false; search: true}
      ? CommerceSearchParameters
      : never;

function loadCommerceCommonParameterReducers(
  engine: CoreEngineNext
): engine is CoreEngineNext<ParameterManager<Parameters>> {
  engine.addReducers({
    commerceParameters,
    commerceFacetSet,
    commerceSort,
    commercePagination,
    facetOrder,
    manualNumericFacetSet,
  });
  return true;
}

function loadCommerceSearchParameterReducers(
  engine: CoreEngineNext
): engine is CoreEngineNext<ParameterManager<CommerceSearchParameters>> {
  loadCommerceCommonParameterReducers(engine);
  engine.addReducers({query, querySet});
  return true;
}

function loadCommerceProductListingParameterReducers(
  engine: CoreEngineNext
): engine is CoreEngineNext<ParameterManager<ProductListingParameters>> {
  loadCommerceCommonParameterReducers(engine);
  return true;
}
