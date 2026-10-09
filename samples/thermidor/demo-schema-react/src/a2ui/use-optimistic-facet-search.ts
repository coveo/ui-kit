import {useCallback, useEffect, useRef, useState} from 'react';

interface OptimisticFacetSearch {
  query: string;
  onQueryChange: (next: string) => void;
  reset: () => void;
}

/**
 * `backendQuery` overwrites the local input only on an external change; echoes of our own queries
 * arrive lagging or out of order and must not clobber typing.
 */
export function useOptimisticFacetSearch(
  backendQuery: string,
  dispatchSearch: (query: string) => void
): OptimisticFacetSearch {
  const [localQuery, setLocalQuery] = useState(backendQuery);
  // An incoming `backendQuery` found here is our own echo.
  const dispatchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (dispatchedRef.current.has(backendQuery)) {
      return;
    }
    setLocalQuery(backendQuery);
    dispatchedRef.current.clear();
  }, [backendQuery]);

  const onQueryChange = useCallback(
    (next: string) => {
      dispatchedRef.current.add(next);
      setLocalQuery(next);
      dispatchSearch(next);
    },
    [dispatchSearch]
  );

  const reset = useCallback(() => {
    dispatchedRef.current.clear();
    setLocalQuery('');
  }, []);

  return {query: localQuery, onQueryChange, reset};
}
