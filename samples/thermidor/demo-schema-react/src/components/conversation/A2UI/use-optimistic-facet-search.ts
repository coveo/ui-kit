import {useCallback, useEffect, useState} from 'react';

interface OptimisticFacetSearch {
  query: string;
  onQueryChange: (next: string) => void;
  reset: () => void;
}

/**
 * Keeps the facet search input responsive by tracking its value locally while still
 * dispatching a `search` on every change. The backend query stays authoritative: the local
 * value is used as-is unless the backend value differs, in which case the backend wins. The
 * echo of our own dispatch is a no-op because it already equals the local value.
 */
export function useOptimisticFacetSearch(
  backendQuery: string,
  dispatchSearch: (query: string) => void
): OptimisticFacetSearch {
  const [localQuery, setLocalQuery] = useState(backendQuery);

  useEffect(() => {
    setLocalQuery((current) => (current === backendQuery ? current : backendQuery));
  }, [backendQuery]);

  const onQueryChange = useCallback(
    (next: string) => {
      setLocalQuery(next);
      dispatchSearch(next);
    },
    [dispatchSearch]
  );

  const reset = useCallback(() => setLocalQuery(''), []);

  return {query: localQuery, onQueryChange, reset};
}
