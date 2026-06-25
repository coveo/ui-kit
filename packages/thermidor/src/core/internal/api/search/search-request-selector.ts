import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import type {EndpointStateScope} from '@/src/core/interface/utils/interface-types.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {getOrCreatePaginationSelectors} from '@/src/core/internal/pagination/pagination-selectors.js';
import {getOrCreateFacetsSelectors} from '@/src/core/internal/facets/facets-selectors.js';
import {getOrCreateSearchParametersSelectors} from '@/src/core/internal/search-parameters/search-parameters-selectors.js';

export function createSearchEndpointRequestSelector(scope: EndpointStateScope) {
  const sharableInterfaceId = scope.composedInterfaceId ?? scope.interfaceId;

  const searchBox = getOrCreateSearchBoxSelectors(sharableInterfaceId);
  const pagination = getOrCreatePaginationSelectors(scope.interfaceId);
  const facets = getOrCreateFacetsSelectors(scope.interfaceId);
  const searchParams = getOrCreateSearchParametersSelectors(scope.interfaceId);

  return createMemoizedStateSelector(
    searchBox.getQuery,
    pagination.getFirstResult,
    pagination.getPageSize,
    facets.buildFacetsRequest,
    searchParams.getPipeline,
    searchParams.getConstantQuery,
    (query, firstResult, pageSize, facets, pipeline, cq) => ({
      q: query,
      firstResult,
      numberOfResults: pageSize,
      facets,
      pipeline,
      cq,
    })
  );
}
