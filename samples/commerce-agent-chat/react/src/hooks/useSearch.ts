import {useCallback, useEffect, useState} from 'react';

import type {ChatSessionOrchestrator} from '@core/lib/chatSessionOrchestrator.js';
import type {SearchResultsState} from '@core/lib/chatStore.js';

/**
 * @param orchestrator - ChatSessionOrchestrator instance with env config
 * @returns Search state and action functions
 */
export function useSearch(orchestrator: ChatSessionOrchestrator) {
  const store = orchestrator.getStore();
  const [searchState, setSearchState] = useState<SearchResultsState>(() =>
    orchestrator.getSearchResults()
  );

  useEffect(() => {
    const unsubscribe = store.subscribe((sessionState) => {
      setSearchState(sessionState.searchResults);
    });

    return () => {
      unsubscribe();
    };
  }, [store]);
  const search = useCallback(
    async (query: string) => {
      await orchestrator.search(query);
    },
    [orchestrator]
  );
  const searchDebounced = useCallback(
    (query: string, delayMs = 300) => {
      orchestrator.searchDebounced(query, delayMs);
    },
    [orchestrator]
  );
  const loadMore = useCallback(async () => {
    await orchestrator.loadMore();
  }, [orchestrator]);

  const clearSearch = useCallback(() => {
    orchestrator.clearSearch();
  }, [orchestrator]);

  return {
    searchState,
    search,
    searchDebounced,
    loadMore,
    clearSearch,
  };
}
