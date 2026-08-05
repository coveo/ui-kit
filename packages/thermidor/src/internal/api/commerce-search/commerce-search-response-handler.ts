import type {FullEngine} from '@/src/internal/engine/index.js';
import type {CommerceSearchResponse} from '@/src/internal/api/commerce-search/index.js';
import type {CoveoFacetResponse} from '@/src/internal/api/search/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateProductListActions} from '@/src/internal/features/product-list/index.js';
import {getOrCreatePaginationActions} from '@/src/internal/features/pagination/index.js';
import {getOrCreateFacetsActions} from '@/src/internal/features/facets/index.js';
import {getOrCreateSortActions, fromCommerceApiSort} from '@/src/internal/features/sort/index.js';
import type {CommerceApiSortPayload} from '@/src/internal/features/sort/index.js';
import {getOrCreateTriggersActions} from '@/src/internal/features/triggers/index.js';
import {getOrCreateQueryCorrectionActions} from '@/src/internal/features/query-correction/index.js';

export function createCommerceSearchEndpointResponseHandler(iface: InterfaceHandle) {
  const productListActions = getOrCreateProductListActions(iface);
  const paginationActions = getOrCreatePaginationActions(iface);
  const facetActions = getOrCreateFacetsActions(iface);
  const sortActions = getOrCreateSortActions(iface);
  const triggersActions = getOrCreateTriggersActions(iface);
  const queryCorrectionActions = getOrCreateQueryCorrectionActions(iface);

  return (engine: FullEngine, response: CommerceSearchResponse) => {
    engine.mutate(productListActions.setProductsFromResponse(response.products));

    const perPage = response.pagination.perPage ?? response.pagination.pageSize ?? 20;
    engine.mutate(paginationActions.setTotalCount(response.pagination.totalEntries));
    engine.mutate(paginationActions.setFirstResult(response.pagination.page * perPage));
    engine.mutate(paginationActions.setPageSize(perPage));

    if (response.facets && response.facets.length > 0) {
      engine.mutate(
        facetActions.updateFromResponse(response.facets as unknown as CoveoFacetResponse[])
      );
    }

    if (response.sort) {
      engine.mutate(
        sortActions.updateFromResponse({
          appliedSort: fromCommerceApiSort(
            response.sort.appliedSort as unknown as CommerceApiSortPayload
          ),
          availableSorts: response.sort.availableSorts.map((s) =>
            fromCommerceApiSort(s as unknown as CommerceApiSortPayload)
          ),
        })
      );
    }

    if (response.triggers && response.triggers.length > 0) {
      engine.mutate(triggersActions.setTriggers(response.triggers));
    }

    if (response.queryCorrection !== undefined) {
      engine.mutate(queryCorrectionActions.setQueryCorrection(response.queryCorrection));
    }
  };
}
