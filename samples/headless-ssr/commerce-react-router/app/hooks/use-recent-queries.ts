import {useEffect} from 'react';

const recentQueriesKeyStorageKey = 'commerce-recent-queries';

function getStoredRecentQueries(): string[] {
  const storedQueries = localStorage.getItem(recentQueriesKeyStorageKey);
  if (storedQueries) {
    try {
      return JSON.parse(storedQueries);
    } catch (error) {
      console.error('Failed to parse recent queries from localStorage:', error);
    }
  }
  return [];
}

function saveRecentQueries(queries: string[]) {
  localStorage.setItem(recentQueriesKeyStorageKey, JSON.stringify(queries));
}

export function useInitializeRecentQueries(
  updateRecentQueries?: (queries: string[]) => void
) {
  useEffect(() => {
    const queries = getStoredRecentQueries();
    if (updateRecentQueries && queries.length > 0) {
      updateRecentQueries(queries);
    }
  }, [updateRecentQueries]);
}

export function usePersistQuery(query: string | null) {
  useEffect(() => {
    if (!query || query.trim() === '') {
      return;
    }

    const queries = getStoredRecentQueries();
    queries.unshift(query);
    saveRecentQueries(queries);
  }, [query]);
}
