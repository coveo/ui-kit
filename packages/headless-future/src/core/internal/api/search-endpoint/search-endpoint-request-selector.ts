import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import type {EndpointStateScope} from '@/src/core/interface/utils/interface-types.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {getOrCreatePaginationSelectors} from '@/src/core/internal/pagination/pagination-selectors.js';
import {getOrCreateFacetsSelectors} from '@/src/core/internal/facets/facets-selectors.js';

export function createSearchEndpointRequestSelector(scope: EndpointStateScope) {
  const sharableInterfaceId = scope.composedInterfaceId ?? scope.interfaceId;

  const searchBox = getOrCreateSearchBoxSelectors(sharableInterfaceId);
  const pagination = getOrCreatePaginationSelectors(scope.interfaceId);
  const facets = getOrCreateFacetsSelectors(scope.interfaceId);

  return createMemoizedStateSelector(
    searchBox.getQuery,
    pagination.getFirstResult,
    pagination.getPageSize,
    facets.buildFacetsRequest,
    (query, firstResult, pageSize, facets) => ({
      q: query,
      firstResult,
      numberOfResults: pageSize,
      facets,
    })
  );
}
