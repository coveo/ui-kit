import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common.js';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithProps,
} from '../../../../app/commerce-ssr-engine/types/common.js';
import {
  createControllerWithKind,
  Kind,
} from '../../../../app/commerce-ssr-engine/types/kind.js';
// import {Kind} from '../../../../app/commerce-ssr-engine/types/kind.js';
import {CoreEngineNext} from '../../../../app/engine.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {manualNumericFacetReducer as manualNumericFacetSet} from '../../../../features/commerce/facets/numeric-facet/manual-numeric-facet-slice.js';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice.js';
import {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import {parametersReducer as commerceParameters} from '../../../../features/commerce/parameters/parameters-slice.js';
import {ProductListingParameters} from '../../../../features/commerce/product-listing-parameters/product-listing-parameters-actions.js';
import {queryReducer as query} from '../../../../features/commerce/query/query-slice.js';
import {CommerceSearchParameters} from '../../../../features/commerce/search-parameters/search-parameters-actions.js';
import {sortReducer as commerceSort} from '../../../../features/commerce/sort/sort-slice.js';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice.js';
import {querySetReducer as querySet} from '../../../../features/query-set/query-set-slice.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {buildProductListing} from '../../product-listing/headless-product-listing.js';
import {buildSearch} from '../../search/headless-search.js';
import {
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
} from './headless-core-parameter-manager.js';

export type {
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
  CommerceSearchParameters,
};

/**
 * Defines a `ParameterManager` controller instance.
 * @group Definers
 *
 * @returns The `ParameterManager` controller definition.
 *
 * @internal
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
