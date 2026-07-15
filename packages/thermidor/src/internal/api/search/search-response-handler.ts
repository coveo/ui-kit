import type {FullEngine} from '@/src/internal/engine/index.js';
import type {CoveoSearchEndpointResponse} from '@/src/internal/api/search/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateResultsActions} from '@/src/internal/features/result-list/index.js';
import {getOrCreatePaginationActions} from '@/src/internal/features/pagination/index.js';
import {getOrCreateFacetsActions} from '@/src/internal/features/facets/index.js';

export function createSearchEndpointResponseHandler(iface: InterfaceHandle) {
  const resultActions = getOrCreateResultsActions(iface);
  const paginationActions = getOrCreatePaginationActions(iface);
  const facetActions = getOrCreateFacetsActions(iface);

  return (engine: FullEngine, response: CoveoSearchEndpointResponse) => {
    engine.mutate(resultActions.setResultsFromResponse(response.results));
    engine.mutate(paginationActions.setTotalCount(response.totalCount));
    engine.mutate(facetActions.updateFromResponse(response.facets));
  };
}
