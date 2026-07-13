import type {FullEngine} from '@/src/internal/engine/index.js';
import type {CommerceSearchResponse} from '@/src/internal/api/commerce-search/index.js';
import type {CoveoFacetResponse} from '@/src/internal/api/search/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateProductListActions} from '@/src/internal/features/product-list/index.js';
import {getOrCreatePaginationActions} from '@/src/internal/features/pagination/index.js';
import {getOrCreateFacetsActions} from '@/src/internal/features/facets/index.js';
import {getOrCreateSortActions} from '@/src/internal/features/sort/index.js';
import {getOrCreateTriggersActions} from '@/src/internal/features/triggers/index.js';
import {getOrCreateQueryCorrectionActions} from '@/src/internal/features/query-correction/index.js';

export function createCommerceSearchEndpointResponseHandler(
  iface: InterfaceHandle
) {
  const productListActions = getOrCreateProductListActions(iface);
  const paginationActions = getOrCreatePaginationActions(iface);
  const facetActions = getOrCreateFacetsActions(iface);
  const sortActions = getOrCreateSortActions(iface);
  const triggersActions = getOrCreateTriggersActions(iface);
  const queryCorrectionActions = getOrCreateQueryCorrectionActions(iface);

  return (engine: FullEngine, response: CommerceSearchResponse) => {
    engine.mutate(
      productListActions.setProductsFromResponse(response.products)
    );

    engine.mutate(
      paginationActions.setTotalCount(response.pagination.totalEntries)
    );
    engine.mutate(
      paginationActions.setFirstResult(
        response.pagination.page * response.pagination.perPage
      )
    );
    engine.mutate(paginationActions.setPageSize(response.pagination.perPage));

    if (response.facets.length > 0) {
      engine.mutate(
        facetActions.updateFromResponse(
          response.facets as unknown as CoveoFacetResponse[]
        )
      );
    }

    if (response.sort) {
      engine.mutate(sortActions.updateFromResponse(response.sort));
    }

    if (response.triggers.length > 0) {
      engine.mutate(triggersActions.setTriggers(response.triggers));
    }

    if (response.queryCorrection !== undefined) {
      engine.mutate(
        queryCorrectionActions.setQueryCorrection(response.queryCorrection)
      );
    }
  };
}
