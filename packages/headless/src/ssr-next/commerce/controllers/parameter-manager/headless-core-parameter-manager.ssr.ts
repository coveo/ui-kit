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
import {loadReducerError} from '../../../../utils/errors.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithProps} from '../../types/controller-definitions.js';

export type {
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
  CommerceSearchParameters,
};

export type ParameterManagerDefinition =
  SearchAndListingControllerDefinitionWithProps<
    ParameterManager<ProductListingParameters | CommerceSearchParameters>,
    SSRParameterManagerProps<
      ProductListingParameters | CommerceSearchParameters
    >
  >;

/**
 * Defines a `ParameterManager` controller instance.
 * @group Definers
 *
 * @returns The `ParameterManager` controller definition.
 *
 * Note: This controller is automatically included in all engine definitions. You do not need to add it manually to your engine definition configuration.
 */
export function defineParameterManager(): ParameterManagerDefinition {
  return {
    listing: true,
    search: true,
    buildWithProps: (engine, props, solutionType) => {
      if (solutionType === SolutionType.listing) {
        if (!loadCommerceProductListingParameterReducers(engine)) {
          throw loadReducerError;
        }
        return buildProductListing(engine).parameterManager({
          ...props,
          excludeDefaultParameters: true,
        });
      } else {
        if (!loadCommerceSearchParameterReducers(engine)) {
          throw loadReducerError;
        }

        return buildSearch(engine).parameterManager({
          ...props,
          excludeDefaultParameters: true,
        });
      }
    },
  };
}

export interface SSRParameterManagerProps<T extends Parameters>
  extends Omit<ParameterManagerProps<T>, 'excludeDefaultParameters'> {}

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
