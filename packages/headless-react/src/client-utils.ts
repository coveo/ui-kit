'use client';

import {type DependencyList, useEffect, useReducer, useRef} from 'react';

/**
 * Subscriber is a function that takes a single argument, which is another function `listener` that returns `void`. The Subscriber function itself returns another function that can be used to unsubscribe the `listener`.
 */
type Subscriber = (listener: () => void) => () => void;

type SnapshotGetter<T> = () => T;

/**
 * Determine if the given list of dependencies has changed.
 */
function useHasDepsChanged(deps: DependencyList) {
  const ref = useRef<DependencyList | null>(null);
  if (ref.current === null) {
    ref.current = deps;
    return false;
  }
  if (
    ref.current.length === deps.length &&
    !deps.some((dep, i) => !Object.is(ref.current![i], dep))
  ) {
    return false;
  }
  ref.current = deps;
  return true;
}

/**
 * Alternate for `useSyncExternalStore` which runs into infinite loops when hooks are used in `getSnapshot`
 * https://github.com/facebook/react/issues/24529
 */
export function useSyncMemoizedStore<T>(
  subscribe: Subscriber,
  getSnapshot: SnapshotGetter<T>
): T {
  const snapshot = useRef<T | null>(null);
  const [, forceRender] = useReducer((s) => s + 1, 0);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribe(() => {
      if (isMounted) {
        snapshot.current = getSnapshot();
        forceRender();
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [subscribe, getSnapshot]);

  // Since useRef does not take a dependencies array changes to dependencies need to be processed explicitly
  if (
    useHasDepsChanged([subscribe, getSnapshot]) ||
    snapshot.current === null
  ) {
    snapshot.current = getSnapshot();
  }

  return snapshot.current;
}
