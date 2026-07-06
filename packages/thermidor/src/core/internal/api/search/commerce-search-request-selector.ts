import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import type {EndpointStateScope} from '@/src/core/interface/utils/interface-types.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {getOrCreatePaginationSelectors} from '@/src/core/internal/pagination/pagination-selectors.js';
import {getOrCreateFacetsSelectors} from '@/src/core/internal/facets/facets-selectors.js';
import {getOrCreateSortSelectors} from '@/src/core/internal/sort/sort-selectors.js';
import {getOrCreateConfigurationSelectors} from '@/src/core/internal/configuration/configuration-selectors.js';
import type {CommerceSearchSortCriterion} from '@/src/api/interface/commerce-search-endpoint/commerce-search-endpoint-types.js';

export interface CommerceSearchEndpointRequest {
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  query: string;
  page: number;
  perPage: number;
  facets: Array<{facetId: string; selectedValues: string[]}>;
  sort: CommerceSearchSortCriterion[];
  context: {view: {url: string}};
}

export function createCommerceSearchEndpointRequestSelector(
  scope: EndpointStateScope
) {
  const configuration = getOrCreateConfigurationSelectors();
  const searchBox = getOrCreateSearchBoxSelectors(scope.scopeInterface);
  const pagination = getOrCreatePaginationSelectors(scope.baseInterface);
  const facets = getOrCreateFacetsSelectors(scope.baseInterface);
  const sort = getOrCreateSortSelectors(scope.baseInterface);

  return createMemoizedStateSelector(
    configuration.getTrackingId,
    configuration.getLanguage,
    configuration.getCountry,
    configuration.getCurrency,
    searchBox.getQuery,
    pagination.getPage,
    pagination.getPageSize,
    facets.buildFacetsRequest,
    sort.buildSortRequest,
    (
      trackingId,
      language,
      country,
      currency,
      query,
      page,
      perPage,
      facets,
      sort
    ): CommerceSearchEndpointRequest => ({
      trackingId,
      language,
      country,
      currency,
      query,
      page,
      perPage,
      facets,
      sort,
      context: {view: {url: ''}},
    })
  );
}
