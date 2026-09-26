import {useCallback, useEffect, useState} from 'react';

interface OptimisticFacetSearch {
  query: string;
  onQueryChange: (next: string) => void;
  reset: () => void;
}

/**
 * Keeps the facet search input responsive by tracking its value in LOCAL React state while
 * still dispatching a validated `search` action on every change. In-progress input is never
 * written to the shared A2-UI data model; it lives only here. The authoritative facet-search
 * query is read from the resolved `/state` binding and passed in as `backendQuery`: the local
 * value is used as-is unless the backend value differs, in which case the backend wins. The
 * echo of our own dispatch is a no-op because it already equals the local value.
 *
 * `dispatchSearch` emits a standard A2-UI `search` action through the renderer's action seam
 * (`onAction` → `session.dispatchAction`), which validates the payload internally and sends it
 * over the non-bidirectional HTTP Action_Channel — not through A2-UI bidirectional input
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
