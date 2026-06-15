import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {CoveoSearchEndpointResponse} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';
import {getOrCreateResultsActions} from '@/src/core/internal/result-list/result-list-actions.js';
import {getOrCreatePaginationActions} from '@/src/core/internal/pagination/pagination-actions.js';
import {getOrCreateFacetsActions} from '@/src/core/internal/facets/facets-actions.js';

export function createSearchEndpointResponseHandler(interfaceId: string) {
  const resultActions = getOrCreateResultsActions(interfaceId);
  const paginationActions = getOrCreatePaginationActions(interfaceId);
  const facetActions = getOrCreateFacetsActions(interfaceId);

  return (engine: FullEngine, response: CoveoSearchEndpointResponse) => {
    engine.mutate(resultActions.setResultsFromResponse(response.results));
    engine.mutate(paginationActions.setTotalCount(response.totalCount));
    engine.mutate(facetActions.updateFromResponse(response.facets));
  };
}
