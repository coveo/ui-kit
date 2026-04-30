/**
 * Layer 1: API Client - Coveo Search API
 *
 * Implements the Coveo Search API (POST /rest/search/v2) integration.
 * Reads state, executes searches, and updates state with results.
 *
 * Architecture constraints:
 * - Only imports from Layer 0 (core state interface)
 * - Never imports Redux directly
 * - Follows engine-first pattern
 * - Returns Promise<void> - updates state via mutations, doesn't return data
 */

import type {Engine} from '@/src/core/interface/engine/engine.js';
import type {State} from '@/src/core/interface/types.js';
import type {SearchResult} from '@/src/core/interface/results/types.js';
import type {
  FacetValue,
  FacetsState,
} from '@/src/core/interface/facets/types.js';
import * as searchBoxSelectors from '@/src/core/interface/search-box/selectors.js';
import * as resultsMutations from '@/src/core/interface/results/mutate.js';
import * as paginationSelectors from '@/src/core/interface/pagination/selectors.js';
import * as paginationMutations from '@/src/core/interface/pagination/mutate.js';
import * as facetSelectors from '@/src/core/interface/facets/selectors.js';
import * as facetMutations from '@/src/core/interface/facets/mutate.js';
import {executeHttpRequest} from '@/src/api/shared/httpClient.js';
import type {
  CoveoSearchRequest,
  CoveoSearchResponse,
  CoveoSearchResult,
  CoveoFacetRequest,
  CoveoFacetResponse,
} from './types.js';

/**
 * Execute a search using the Coveo Search API
 *
 * Reads current state (query, pagination, facets) from the engine,
 * makes an API call to Coveo Search API, and updates state with results.
 *
 * State reading:
 * - Query: searchSelectors.query
 * - Pagination: paginationSelectors.currentPage, pageSize
 * - Facets: facetSelectors.all (to build facet requests and filters)
 *
 * State mutations:
 * - Before: setLoading(true), setError(null)
 * - Success: setResults(), setTotalCount(), updateFacets(), setLoading(false)
 * - Failure: setError(), setLoading(false)
 *
 * @param engine - The headless engine instance
 * @returns Promise that resolves when search completes (check state for results)
 */
export async function executeSearchAPI(engine: Engine): Promise<void> {
  // Set loading state before making the request
  engine.mutate(resultsMutations.setLoading(true));
  engine.mutate(resultsMutations.setError(null));

  try {
    // Read current state to build request
    const query: string = engine.read((state: State): string =>
      searchBoxSelectors.query({searchBox: state.searchBox ?? {query: ''}})
    );
    const currentPage: number = engine.read((state: State): number =>
      paginationSelectors.currentPage({
        pagination: state.pagination ?? {
          currentPage: 1,
          pageSize: 10,
          totalCount: 0,
        },
      })
    );
    const pageSize: number = engine.read((state: State): number =>
      paginationSelectors.pageSize({
        pagination: state.pagination ?? {
          currentPage: 1,
          pageSize: 10,
          totalCount: 0,
        },
      })
    );
    const allFacets: FacetsState = engine.read(
      (state: State): FacetsState =>
        facetSelectors.all({facets: state.facets ?? {}})
    );

    // Build facet requests
    const facetRequests: CoveoFacetRequest[] = Object.values(allFacets).map(
      (facet) => ({
        facetId: facet.id,
        field: facet.id, // Use facet ID as field name for simplicity
        type: 'specific' as const,
        numberOfValues: 10,
        currentValues: facet.selectedValues.map((valueId) => ({
          value: valueId,
          state: 'selected' as const,
        })),
      })
    );

    // Build advanced query from selected facets
    const advancedQuery = buildAdvancedQueryFromFacets(allFacets);

    // Build request body
    const requestBody: CoveoSearchRequest = {
      q: query,
      aq: advancedQuery || undefined,
      numberOfResults: pageSize,
      firstResult: (currentPage - 1) * pageSize,
      facets: facetRequests.length > 0 ? facetRequests : undefined,
      enableDidYouMean: true,
    };

    // Execute HTTP request
    const response = await executeHttpRequest<CoveoSearchResponse>(engine, {
      path: '/rest/search/v2',
      method: 'POST',
      body: requestBody,
    });

    // Handle response
    if (!response.success) {
      // API call failed - update error state
      engine.mutate(
        resultsMutations.setError(response.error || 'Search failed')
      );
      engine.mutate(resultsMutations.setLoading(false));
      return;
    }

    // Transform and update state with results
    const searchResults = transformCoveoResults(response.data!.results);
    engine.mutate(resultsMutations.setResults(searchResults));

    // Update total count for pagination
    engine.mutate(paginationMutations.setTotalCount(response.data!.totalCount));

    // Update facets with response data
    if (response.data!.facets) {
      updateFacetsFromResponse(engine, response.data!.facets, allFacets);
    }

    // Clear loading state
    engine.mutate(resultsMutations.setLoading(false));
  } catch (error) {
    // Unexpected error (should be rare since executeHttpRequest catches most errors)
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    engine.mutate(resultsMutations.setError(errorMessage));
    engine.mutate(resultsMutations.setLoading(false));
  }
}

/**
 * Transform Coveo search results to headless SearchResult format
 *
 * Maps CoveoSearchResult[] -> SearchResult[]
 *
 * @param coveoResults - Results from Coveo API
 * @returns Transformed results matching Layer 0 type definition
 */
function transformCoveoResults(
  coveoResults: CoveoSearchResult[]
): SearchResult[] {
  return coveoResults.map((result) => ({
    id: result.uniqueId,
    title: result.title,
    uri: result.clickUri || result.uri,
    excerpt: result.excerpt || '',
  }));
}

/**
 * Build advanced query expression from selected facet values
 *
 * Converts facet selections into Coveo aq (advanced query) format.
 * Example: "@author==(John,Jane) @category==blog"
 * FacetState
 * @param facets - All facets from state
 * @returns Advanced query string or empty string
 */
function buildAdvancedQueryFromFacets(
  facets: Record<string, {id: string; selectedValues: string[]}>
): string {
  const facetFilters: string[] = [];

  for (const facet of Object.values(facets)) {
    if (facet.selectedValues.length > 0) {
      // Build OR expression for multiple values: @field==(value1,value2)
      const values = facet.selectedValues.join(',');
      facetFilters.push(`@${facet.id}==(${values})`);
    }
  }

  // Combine with AND
  return facetFilters.join(' ');
}

/**
 * Update facet state with response data from Coveo
 *
 * Updates available facet values and counts based on search results.
 * Preserves existing facet configuration (id, label, selectedValues).
 *
 * @param engine - The headless engine
 * @param coveoFacets - Facet data from Coveo response
 * @param currentFacets - CurrenFacetState
 */
function updateFacetsFromResponse(
  engine: Engine,
  coveoFacets: CoveoFacetResponse[],
  currentFacets: Record<
    string,
    {id: string; label: string; selectedValues: string[]}
  >
): void {
  for (const coveoFacet of coveoFacets) {
    const currentFacet = currentFacets[coveoFacet.facetId];

    if (!currentFacet) {
      // Facet not in current state - skip
      continue;
    }

    // Transform Coveo facet values to headless format
    const facetValues: FacetValue[] = coveoFacet.values.map((value) => ({
      id: value.value,
      label: value.value,
      count: value.numberOfResults,
    }));

    // Update facet values while preserving selections
    engine.mutate(facetMutations.updateValues(coveoFacet.facetId, facetValues));
  }
}
