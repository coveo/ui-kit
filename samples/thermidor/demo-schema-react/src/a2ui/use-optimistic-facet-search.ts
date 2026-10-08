import {useRef, useState} from 'react';
import type {CategoryFacetAction, RegularFacetAction} from '@coveo/thermidor-schema/zod3';

/** The `search` / `clearSearch` members of the facet action unions, derived so the payload cannot drift from what the schema accepts. */
export type FacetSearchAction = Extract<
  RegularFacetAction | CategoryFacetAction,
  {event: {name: 'search' | 'clearSearch'}}
>;

export interface OptimisticFacetSearch {
  query: string;
  onQueryChange: (next: string) => void;
  reset: () => void;
}

/**
 * Facet search input as sovereign LOCAL state: the typed text is NOT the optimistic hold of the
 * `search` dispatch, so a withheld/cancelled/lost keystroke leaves the field untouched instead of
 * snapping back to the producer. A genuine external change still wins — see below.
 */
export function useOptimisticFacetSearch(
  backendQuery: string,
  dispatch: (action: FacetSearchAction) => void
): OptimisticFacetSearch {
  const [typed, setTyped] = useState(backendQuery);
  const lastBackend = useRef(backendQuery);

  // A moved `backendQuery` is a real producer change (echo of our keystroke excepted) and wins;
  // a dispatch that never answered leaves it put, so the local text survives. The move IS the signal.
  if (backendQuery !== lastBackend.current) {
    lastBackend.current = backendQuery;
    if (backendQuery !== typed) {
      setTyped(backendQuery);
    }
  }

  const onQueryChange = (next: string) => {
    setTyped(next);
    dispatch({event: {name: 'search', context: {query: next}}});
  };

  const reset = () => {
    setTyped('');
    dispatch({event: {name: 'clearSearch', context: {}}});
  };

  return {query: typed, onQueryChange, reset};
}
