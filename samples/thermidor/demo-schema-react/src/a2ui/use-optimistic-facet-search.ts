import {useId, useLayoutEffect, useRef, useState} from 'react';
import type {CategoryFacetAction, RegularFacetAction} from '@coveo/thermidor-schema/zod3';
import {useDispatchProgress} from './pending-dispatch.js';

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

/**
 * The typed text is local state, not an optimistic hold, so a keystroke that never reaches the
 * producer leaves the field untouched. An external change of the query wins; our own echo does not.
 */
export function useOptimisticFacetSearch(
  backendQuery: string,
  dispatch: (action: FacetSearchAction) => void
): OptimisticFacetSearch {
  const slot = useId();
  const {declareGesture, lastIssued} = useDispatchProgress();
  const [typed, setTyped] = useState(backendQuery);
  const lastBackend = useRef(backendQuery);
  // Queries whose echo can still arrive, in send order (the queue serializes sends).
  const pending = useRef<string[]>([]);

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
    const before = lastIssued()?.id;
    const withdraw = declareGesture({
      coalesce: {slot, gesture: `${slot}|${action.event.name}`, policy: 'absolute'},
      invalidates: [],
    });
    try {
      dispatch(action);
    } finally {
      withdraw();
    }
    const issued = lastIssued();
    if (!issued || issued.id === before) {
      return;
    }
    pending.current.push(query);
    issued.onSettled((outcome) => {
      // Never answered, so no echo will come: drop it, or it would swallow a later external
      // change. An answer that didn't move the prop can stay: the prop must leave that value
      // first, and whatever moves it clears the entry.
      if (outcome !== 'answered') {
        const i = pending.current.lastIndexOf(query);
        if (i !== -1) {
          pending.current.splice(i, 1);
        }
      }
    });
  };

  const onQueryChange = (next: string) => {
    setTyped(next);
    send({event: {name: 'search', context: {query: next}}}, next);
  };

  const reset = () => {
    setTyped('');
    send({event: {name: 'clearSearch', context: {}}}, '');
  };

  return {query: typed, onQueryChange, reset};
}
