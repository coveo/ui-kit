import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {CoveoSearchEndpointResponse} from './search-endpoint-types.js';
import * as resultListActions from '@/src/core/internal/result-list/result-list-actions.js';
import * as paginationActions from '@/src/core/internal/pagination/pagination-actions.js';
import * as facetsActions from '@/src/core/internal/facets/facets-actions.js';

export const handleSearchEndpointResponse = (
  engine: FullEngine,
  response: CoveoSearchEndpointResponse
) => {
  engine.mutate(resultListActions.setResultsFromResponse(response.results));
  engine.mutate(paginationActions.setTotalCount(response.totalCount));
  engine.mutate(facetsActions.updateFromResponse(response.facets));
};
