import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {CommerceSearchResponse} from '@/src/api/interface/commerce-search-endpoint/commerce-search-endpoint-types.js';
import type {CoveoFacetResponse} from '@/src/core/interface/api/search/search-types.js';
import {getOrCreateProductListActions} from '@/src/core/internal/product-list/product-list-actions.js';
import {getOrCreatePaginationActions} from '@/src/core/internal/pagination/pagination-actions.js';
import {getOrCreateFacetsActions} from '@/src/core/internal/facets/facets-actions.js';
import {getOrCreateSortActions} from '@/src/core/internal/sort/sort-actions.js';
import {getOrCreateTriggersActions} from '@/src/core/internal/triggers/triggers-actions.js';
import {getOrCreateQueryCorrectionActions} from '@/src/core/internal/query-correction/query-correction-actions.js';

export function createCommerceSearchEndpointResponseHandler(
  interfaceId: string
) {
  const productListActions = getOrCreateProductListActions(interfaceId);
  const paginationActions = getOrCreatePaginationActions(interfaceId);
  const facetActions = getOrCreateFacetsActions(interfaceId);
  const sortActions = getOrCreateSortActions(interfaceId);
  const triggersActions = getOrCreateTriggersActions(interfaceId);
  const queryCorrectionActions = getOrCreateQueryCorrectionActions(interfaceId);

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
