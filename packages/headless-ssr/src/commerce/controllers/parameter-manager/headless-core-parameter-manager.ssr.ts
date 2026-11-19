import type {CoreEngineNext} from '@coveo/headless/commerce';
import type {
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
} from '@coveo/headless/commerce';
import {buildProductListing} from '@coveo/headless/commerce';
import {buildSearch} from '@coveo/headless/commerce';
import {commerceFacetOrderReducer as facetOrder} from '@coveo/headless/ssr-internal';
import {commerceFacetSetReducer as commerceFacetSet} from '@coveo/headless/ssr-internal';
import {manualNumericFacetReducer as manualNumericFacetSet} from '@coveo/headless/ssr-internal';
import {commercePaginationReducer as commercePagination} from '@coveo/headless/ssr-internal';
import type {Parameters} from '@coveo/headless/commerce';
import {parametersReducer as commerceParameters} from '@coveo/headless/ssr-internal';
import type {ProductListingParameters} from '@coveo/headless/ssr-internal';
import {commerceQueryReducer as query} from '@coveo/headless/ssr-internal';
import {commerceQuerySetReducer as querySet} from '@coveo/headless/ssr-internal';
import type {CommerceSearchParameters} from '@coveo/headless/commerce';
import {sortReducer as commerceSort} from '@coveo/headless/ssr-internal';
import {loadReducerError} from '@coveo/headless/ssr-internal';
import {SolutionType} from '../../types/controller-constants.js';
import type {SearchAndListingControllerDefinitionWithProps} from '../../types/controller-definitions.js';

export type {
  CommerceSearchParameters,
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
};

export type ParameterManagerDefinition = SearchAndListingControllerDefinitionWithProps<
  ParameterManager<ProductListingParameters | CommerceSearchParameters>,
  SSRParameterManagerProps<ProductListingParameters | CommerceSearchParameters>
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

export interface SSRParameterManagerProps<T extends Parameters> extends Omit<
  ParameterManagerProps<T>,
  'excludeDefaultParameters'
> {}

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
