import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {CategoryFacetAction, RegularFacetAction} from '@coveo/thermidor-schema/zod3';
import {useLatestWhenFree} from './session-request.js';

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

/** A search goes out once typing pauses, so a burst of keystrokes sends one request. */
export const SEARCH_DEBOUNCE_MS = 200;

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
  // The search waiting for the session to be free; a new object for each search, even a repeated one.
  const [pending, setPending] = useState<{action: FacetSearchAction; query: string}>();

  // Queries sent whose echo can still arrive, in send order.
  const sent = useRef<string[]>([]);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // A surface rebuilt by a reply retires the previous render's dispatch, so a search that fires
  // later must use the latest one.
  const latestDispatch = useRef(dispatch);
  latestDispatch.current = dispatch;

  const cancelDebounce = () => {
    clearTimeout(debounce.current);
    debounce.current = undefined;
  };

  useEffect(() => cancelDebounce, []);

  // Layout, so an adopted external change lands before paint.
  useLayoutEffect(() => {
    if (backendQuery === lastBackend.current) {
      return;
    }
    lastBackend.current = backendQuery;
    const echo = sent.current.indexOf(backendQuery);
    if (echo !== -1) {
      // Our echo: everything sent before it has been answered too.
      sent.current = sent.current.slice(echo + 1);
    } else {
      // External change: the producer wins over what is typed or waiting to be sent.
      sent.current = [];
      cancelDebounce();
      setPending(undefined);
      setTyped(backendQuery);
    }
  }, [backendQuery]);

  useLatestWhenFree(pending, ({action, query}) => {
    sent.current.push(query);
    latestDispatch.current(action);
  });

  const onQueryChange = (next: string) => {
    setTyped(next);
    cancelDebounce();
    setPending(undefined);
    debounce.current = setTimeout(() => {
      debounce.current = undefined;
      setPending({action: {event: {name: 'search', context: {query: next}}}, query: next});
    }, SEARCH_DEBOUNCE_MS);
  };

  const reset = () => {
    setTyped('');
    cancelDebounce();
    setPending({action: {event: {name: 'clearSearch', context: {}}}, query: ''});
  };

  return {query: typed, onQueryChange, reset};
}
