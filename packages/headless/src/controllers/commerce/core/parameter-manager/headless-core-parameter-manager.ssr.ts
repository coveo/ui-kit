import {ensureAtLeastOneSolutionType} from '../../../../app/commerce-ssr-engine/common';
import {
  ControllerDefinitionOption,
  SolutionType,
  SubControllerDefinitionWithProps,
} from '../../../../app/commerce-ssr-engine/types/common';
import {CoreEngineNext} from '../../../../app/engine';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../../features/commerce/facets/facet-set/facet-set-slice';
import {manualNumericFacetReducer as manualNumericFacetSet} from '../../../../features/commerce/facets/numeric-facet/manual-numeric-facet-slice';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice';
import {Parameters} from '../../../../features/commerce/parameters/parameters-actions';
import {ProductListingParameters} from '../../../../features/commerce/product-listing-parameters/product-listing-parameters-actions';
import {queryReducer as query} from '../../../../features/commerce/query/query-slice';
import {CommerceSearchParameters} from '../../../../features/commerce/search-parameters/search-parameters-actions';
import {sortReducer as commerceSort} from '../../../../features/commerce/sort/sort-slice';
import {facetOrderReducer as facetOrder} from '../../../../features/facets/facet-order/facet-order-slice';
import {querySetReducer as querySet} from '../../../../features/query-set/query-set-slice';
import {loadReducerError} from '../../../../utils/errors';
import {buildProductListing} from '../../product-listing/headless-product-listing';
import {buildSearch} from '../../search/headless-search';
import {
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
} from './headless-core-parameter-manager';

export type {
  ParameterManager,
  ParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
  CommerceSearchParameters,
};

export function defineParameterManager<
  TOptions extends ControllerDefinitionOption | undefined,
>(options?: TOptions) {
  ensureAtLeastOneSolutionType(options);
  return {
    ...options,
    buildWithProps: (engine, props, solutionType) => {
      if (solutionType === SolutionType.listing) {
        if (!loadCommerceResultListParameterReducers(engine)) {
          throw loadReducerError;
        }
        return buildProductListing(engine).parameterManager(props);
      } else {
        if (!loadCommerceSearchParameterReducers(engine)) {
          throw loadReducerError;
        }
        return buildSearch(engine).parameterManager(props);
      }
    },
  } as SubControllerDefinitionWithProps<
    ParameterManager<MappedParameterTypes<typeof options>>,
    TOptions,
    ParameterManagerProps<MappedParameterTypes<typeof options>>
  >;
}

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

function loadCommerceResultListParameterReducers(
  engine: CoreEngineNext
): engine is CoreEngineNext<ParameterManager<ProductListingParameters>> {
  loadCommerceCommonParameterReducers(engine);
  return true;
}
