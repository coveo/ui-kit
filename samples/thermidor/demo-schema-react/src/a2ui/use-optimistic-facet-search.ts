import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {CategoryFacetAction, RegularFacetAction} from '@coveo/thermidor-schema/zod3';

/** Derived from the schema so the payload cannot drift from what it accepts. */
export type FacetSearchAction = Extract<
  RegularFacetAction | CategoryFacetAction,
  {event: {name: 'search' | 'clearSearch'}}
>;

export interface OptimisticFacetSearch {
  query: string;
  onQueryChange: (next: string) => void;
  reset: () => void;
}

/** Typing sends one search per pause instead of one per keystroke. */
const SEARCH_DEBOUNCE_MS = 200;

/**
 * The typed text is local state, not an optimistic hold, so a keystroke that never reaches the
 * producer leaves the field untouched. An external change of the query wins; our own echo does not.
 */
export function useOptimisticFacetSearch(
  backendQuery: string,
  dispatch: (action: FacetSearchAction) => void
): OptimisticFacetSearch {
  const [typed, setTyped] = useState(backendQuery);
  const lastBackend = useRef(backendQuery);
  // Queries whose echo can still arrive, in send order (the session serializes sends).
  const pending = useRef<string[]>([]);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(debounce.current), []);

  // Layout, so an adopted external change lands before paint.
  useLayoutEffect(() => {
    if (backendQuery === lastBackend.current) {
      return;
    }
    lastBackend.current = backendQuery;
    const echo = pending.current.indexOf(backendQuery);
    if (echo !== -1) {
      // Our echo: everything older has been answered too.
      pending.current = pending.current.slice(echo + 1);
    } else {
      // External change: the producer wins.
      pending.current = [];
      setTyped(backendQuery);
    }
  }, [backendQuery]);

  const send = (action: FacetSearchAction, query: string) => {
    clearTimeout(debounce.current);
    pending.current.push(query);
    dispatch(action);
  };

  const onQueryChange = (next: string) => {
    setTyped(next);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(
      () => send({event: {name: 'search', context: {query: next}}}, next),
      SEARCH_DEBOUNCE_MS
    );
  };

  const reset = () => {
    setTyped('');
    send({event: {name: 'clearSearch', context: {}}}, '');
  };

  return {query: typed, onQueryChange, reset};
}
