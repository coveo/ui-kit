import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import type {EndpointStateScope} from '@/src/internal/utils/index.js';
import {getOrCreateSearchBoxSelectors} from '@/src/internal/features/search-box/index.js';
import {getOrCreatePaginationSelectors} from '@/src/internal/features/pagination/index.js';
import {getOrCreateFacetsSelectors} from '@/src/internal/features/facets/index.js';
import {getOrCreateSortSelectors} from '@/src/internal/features/sort/index.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';
import type {CommerceSearchSortCriterion} from '@/src/internal/api/commerce-search/index.js';

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
