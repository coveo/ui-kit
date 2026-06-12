import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import type {CoveoSearchEndpointResponse} from './search-endpoint-types.js';
import {setResultsFromResponse} from '@/src/core/internal/result-list/result-list-actions.js';
import {setTotalCount} from '@/src/core/internal/pagination/pagination-actions.js';
import {updateFromResponse} from '@/src/core/internal/facets/facets-actions.js';

export const handleSearchEndpointResponse = (
  engine: FullEngine,
  response: CoveoSearchEndpointResponse
) => {
  engine.mutate(setResultsFromResponse(response.results));
  engine.mutate(setTotalCount(response.totalCount));
  engine.mutate(updateFromResponse(response.facets));
};
