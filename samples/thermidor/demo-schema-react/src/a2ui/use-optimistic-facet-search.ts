import {useCallback, useEffect, useRef, useState} from 'react';

interface OptimisticFacetSearch {
  query: string;
  onQueryChange: (next: string) => void;
  reset: () => void;
}

/**
 * Keeps the facet search input responsive by tracking its value in local state while dispatching a
 * `search` action on every change; in-progress input never touches the shared A2-UI data model.
 *
 * The input is owned by the user's typing. `backendQuery` (from `/state`) seeds the initial value
 * and overwrites the local value only on a genuinely external change — a query the user did not
 * type, such as a selection clearing the search. The backend also echoes back each query we
 * dispatch, often lagging or out of order; those echoes must never clobber in-flight typing.
 */
export function useOptimisticFacetSearch(
  backendQuery: string,
  dispatchSearch: (query: string) => void
): OptimisticFacetSearch {
  const [localQuery, setLocalQuery] = useState(backendQuery);
  // Every query the user has dispatched; an incoming `backendQuery` found here is our own echo.
  const dispatchedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (dispatchedRef.current.has(backendQuery)) {
      // Lagging/out-of-order echo of a query we dispatched — keep what the user typed.
      return;
    }
    // External change (not something we typed): the backend wins.
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
