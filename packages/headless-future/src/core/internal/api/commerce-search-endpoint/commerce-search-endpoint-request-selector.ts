import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import type {EndpointStateScope} from '@/src/core/interface/utils/interface-types.js';
import {getOrCreateSearchBoxSelectors} from '@/src/core/internal/search-box/search-box-selectors.js';
import {getOrCreatePaginationSelectors} from '@/src/core/internal/pagination/pagination-selectors.js';
import {getOrCreateFacetsSelectors} from '@/src/core/internal/facets/facets-selectors.js';
import {getOrCreateSortSelectors} from '@/src/core/internal/sort/sort-selectors.js';
import {initialConfigurationState} from '@/src/core/internal/configuration/configuration-slice.js';
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
  const sharableInterfaceId = scope.composedInterfaceId ?? scope.interfaceId;

  const searchBox = getOrCreateSearchBoxSelectors(sharableInterfaceId);
  const pagination = getOrCreatePaginationSelectors(scope.interfaceId);
  const facets = getOrCreateFacetsSelectors(scope.interfaceId);
  const sort = getOrCreateSortSelectors(scope.interfaceId);

  const getTrackingId = (state: Record<string, unknown>) =>
    (state['configuration'] as typeof initialConfigurationState | undefined)
      ?.trackingId ?? '';

  const getLanguage = (state: Record<string, unknown>) =>
    (state['configuration'] as typeof initialConfigurationState | undefined)
      ?.language ?? '';

  const getCountry = (state: Record<string, unknown>) =>
    (state['configuration'] as typeof initialConfigurationState | undefined)
      ?.country ?? '';

  const getCurrency = (state: Record<string, unknown>) =>
    (state['configuration'] as typeof initialConfigurationState | undefined)
      ?.currency ?? '';

  return createMemoizedStateSelector(
    getTrackingId,
    getLanguage,
    getCountry,
    getCurrency,
    searchBox.getQuery,
    pagination.getFirstResult,
    pagination.getPageSize,
    facets.buildFacetsRequest,
    sort.buildSortRequest,
    (
      trackingId,
      language,
      country,
      currency,
      query,
      firstResult,
      pageSize,
      facets,
      sort
    ): CommerceSearchEndpointRequest => ({
      trackingId,
      language,
      country,
      currency,
      query,
      page: pageSize > 0 ? Math.floor(firstResult / pageSize) : 0,
      perPage: pageSize,
      facets,
      sort,
      context: {view: {url: ''}},
    })
  );
}
