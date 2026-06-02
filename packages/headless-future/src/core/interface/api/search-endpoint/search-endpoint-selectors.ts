import type {CoveoSearchEndpointRequest} from './search-endpoint-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import * as searchBoxSelectors from '@/src/core/interface/search-box/search-box-selectors.js';
import * as paginationSelectors from '@/src/core/interface/pagination/pagination-selectors.js';
import * as facetSelectors from '@/src/core/interface/facets/facets-selectors.js';
import {initialSearchEndpointState} from '@/src/core/internal/api/search-endpoint/search-endpoint-slice.js';
import {State} from '@/src/core/interface/engine/engine-types.js';

const getSearchEndpointState = (state: State) =>
  state.searchEndpoint ?? initialSearchEndpointState;

export const status = createMemoizedStateSelector(
  getSearchEndpointState,
  (state) => state.status
);

export const isLoading = createMemoizedStateSelector(
  getSearchEndpointState,
  (state) => state.status === 'pending'
);

export const error = createMemoizedStateSelector(
  getSearchEndpointState,
  (state) => state.error
);

export const configuration = createMemoizedStateSelector(
  getSearchEndpointState,
  (state) => state.configuration
);

export const buildSearchEndpointRequest = createMemoizedStateSelector(
  searchBoxSelectors.getQuery,
  paginationSelectors.getPageSize,
  paginationSelectors.getFirstResult,
  facetSelectors.buildFacetsRequest,
  (query, pageSize, firstResult, facets): CoveoSearchEndpointRequest => ({
    q: query,
    firstResult: firstResult,
    numberOfResults: pageSize,
    facets: facets,
  })
);
