import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import type {ChatSessionOrchestrator} from '@core/lib/chatSessionOrchestrator.js';
import {
  addSearchResults,
  resetSearch,
  setSearchError,
  setSearchLoading,
  setSearchQuery,
  setSearchResults,
  type SearchResultsState,
} from '@core/lib/chatStore.js';
import {CoveoSearchClient} from '@core/lib/coveoSearchClient.js';

/**
 * React hook for managing direct Coveo Search API queries in search mode.
 *
 * Handles:
 * - Direct Commerce Search API calls (bypassing agent)
 * - Zustand state management for search results
 * - Pagination via load-more pattern
 * - Loading and error states
 * - Query debouncing to avoid excessive requests
 *
 * @param orchestrator - ChatSessionOrchestrator instance with env config
 * @returns Search state and action functions
 */
export function useSearch(orchestrator: ChatSessionOrchestrator) {
  const store = orchestrator.getStore();
  const config = orchestrator.getConfig();

  // Create search client once
  const searchClient = useMemo(() => new CoveoSearchClient(config), [config]);

  // Local React state for UI reactivity
  const [searchState, setSearchState] = useState<SearchResultsState>(() =>
    orchestrator.getSearchResults()
  );

  // Track debounce timer to avoid rapid queries
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe((sessionState) => {
      setSearchState(sessionState.searchResults);
    });

    return () => {
      unsubscribe();
    };
  }, [store]);

  /**
   * Execute a new search query.
   * Resets pagination and fetches first page of results.
   */
  const search = useCallback(
    async (query: string) => {
      // Clear any pending debounce
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const trimmedQuery = query.trim();

      // If query is empty, reset search state
      if (!trimmedQuery) {
        resetSearch(store);
        return;
      }

      // Set query and loading state on store
      setSearchQuery(store, trimmedQuery);
      setSearchLoading(store, true);

      try {
        // Fetch first page (page: 0)
        const response = await searchClient.search(trimmedQuery, 0);

        // Update store with results
        setSearchResults(store, response.results, response.hasMore);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Search failed';
        setSearchError(store, message);
      }
    },
    [store, searchClient]
  );

  /**
   * Execute search with debouncing (for real-time search as user types).
   * Delays query execution by delayMs to avoid excessive API calls.
   */
  const searchDebounced = useCallback(
    (query: string, delayMs = 300) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void search(query);
      }, delayMs);
    },
    [search]
  );

  /**
   * Load next page of results (for load-more pagination).
   * Appends results to existing array rather than replacing.
   */
  const loadMore = useCallback(async () => {
    const currentState = orchestrator.getSearchResults();

    if (!currentState.query || currentState.loading || !currentState.hasMore) {
      return;
    }

    setSearchLoading(store, true);

    try {
      const nextPage = currentState.page + 1;
      const response = await searchClient.search(currentState.query, nextPage);

      // Append results to existing array
      addSearchResults(store, response.results, response.hasMore);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load more';
      setSearchError(store, message);
    }
  }, [store, searchClient, orchestrator]);

  /**
   * Clear all search results and reset to empty state.
   */
  const clearSearch = useCallback(() => {
    resetSearch(store);
  }, [store]);

  return {
    searchState,
    search,
    searchDebounced,
    loadMore,
    clearSearch,
  };
}
