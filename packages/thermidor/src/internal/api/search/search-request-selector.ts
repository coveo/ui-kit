import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateSearchBoxSelectors} from '@/src/internal/features/search-box/index.js';
import {getOrCreatePaginationSelectors} from '@/src/internal/features/pagination/index.js';
import {getOrCreateFacetsSelectors} from '@/src/internal/features/facets/index.js';
import {getOrCreateSearchParametersSelectors} from '@/src/internal/features/search-parameters/index.js';
import {getOrCreateConfigurationSelectors} from '@/src/internal/features/configuration/index.js';

export function createSearchEndpointRequestSelector(iface: InterfaceHandle) {
  const searchBox = getOrCreateSearchBoxSelectors(iface);
  const pagination = getOrCreatePaginationSelectors(iface);
  const facets = getOrCreateFacetsSelectors(iface);
  const searchParams = getOrCreateSearchParametersSelectors(iface);
  const configuration = getOrCreateConfigurationSelectors();

  return createMemoizedStateSelector(
    searchBox.getQuery,
    pagination.getFirstResult,
    pagination.getPageSize,
    facets.buildFacetsRequest,
    searchParams.getPipeline,
    searchParams.getConstantQuery,
    configuration.getLanguage,
    (query, firstResult, pageSize, facets, pipeline, cq, language) => ({
      q: query,
      firstResult,
      numberOfResults: pageSize,
      facets,
      pipeline,
      cq,
      locale: language || undefined,
    })
  );
}
