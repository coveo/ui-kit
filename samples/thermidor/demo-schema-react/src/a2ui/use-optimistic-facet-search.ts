import {useCallback, useEffect, useState} from 'react';

interface OptimisticFacetSearch {
  query: string;
  onQueryChange: (next: string) => void;
  reset: () => void;
}

/**
 * Keeps the facet search input responsive by tracking its value in local state
 * while dispatching a validated `search` action on every change. In-progress
 * input never touches the shared A2-UI data model. The authoritative query comes
 * from `backendQuery` (resolved from `/state`); the local value is used unless the
 * backend value differs, in which case the backend wins. `dispatchSearch` emits a
 * standard A2-UI `search` action through the action seam, not bidirectional input
 * binding.
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
