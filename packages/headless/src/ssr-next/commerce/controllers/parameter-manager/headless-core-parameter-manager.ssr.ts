import type {CoreEngineNext} from '../../../../app/engine.js';
import type {
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
} from '../../../../controllers/commerce/core/parameter-manager/headless-core-parameter-manager.js';
import {buildProductListing} from '../../../../controllers/commerce/product-listing/headless-product-listing.js';
import {buildSearch} from '../../../../controllers/commerce/search/headless-search.js';
import {commerceFacetOrderReducer as facetOrder} from '../../../../features/commerce/facets/facet-order/commerce-facet-order-slice.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {manualNumericFacetReducer as manualNumericFacetSet} from '../../../../features/commerce/facets/numeric-facet/manual-numeric-facet-slice.js';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice.js';
import type {Parameters} from '../../../../features/commerce/parameters/parameters-actions.js';
import {parametersReducer as commerceParameters} from '../../../../features/commerce/parameters/parameters-slice.js';
import type {ProductListingParameters} from '../../../../features/commerce/product-listing-parameters/product-listing-parameters-actions.js';
import {queryReducer as query} from '../../../../features/commerce/query/query-slice.js';
import {commerceQuerySetReducer as querySet} from '../../../../features/commerce/query-set/commerce-query-set-slice.js';
import type {CommerceSearchParameters} from '../../../../features/commerce/search-parameters/search-parameters-actions.js';
import {sortReducer as commerceSort} from '../../../../features/commerce/sort/sort-slice.js';
import {loadReducerError} from '../../../../utils/errors.js';
import type {CommonBuildConfig} from '../../types/build.js';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinition} from '../../types/controller-definitions.js';

export type {
  CommerceSearchParameters,
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
};

export type ParameterManagerDefinition = SearchAndListingControllerDefinition<
  ParameterManager<ProductListingParameters | CommerceSearchParameters>
>;

/**
 * Defines a `ParameterManager` controller instance.
 * @group Definers
 *
 * @returns The `ParameterManager` controller definition.
 *
 * Note: This controller is included in every search and listing engine definition and fed by the `searchParams` option of `fetchStaticState()`.
 */
export function defineParameterManager(): ParameterManagerDefinition {
  return {
    listing: true,
    search: true,
    build: (engine, {solutionType, buildConfig, enableResults}) => {
      const parameters = parametersOf(buildConfig);

      if (solutionType === SolutionType.listing) {
        if (!loadCommerceProductListingParameterReducers(engine)) {
          throw loadReducerError;
        }
        return buildProductListing(engine, {enableResults: enableResults.listing}).parameterManager(
          {
            initialState: {parameters: parameters as ProductListingParameters},
            excludeDefaultParameters: true,
          }
        );
      }

      if (!loadCommerceSearchParameterReducers(engine)) {
        throw loadReducerError;
      }
      return buildSearch(engine, {enableResults: enableResults.search}).parameterManager({
        initialState: {parameters: parameters as CommerceSearchParameters},
        excludeDefaultParameters: true,
      });
    },
  };
}

function parametersOf(buildConfig: CommonBuildConfig) {
  const {q, ...rest} = (buildConfig.searchParams as Parameters & {q?: string}) || {};
  return {
    ...{q},
    ...(rest && typeof rest === 'object' ? rest : {}),
  };
}

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
