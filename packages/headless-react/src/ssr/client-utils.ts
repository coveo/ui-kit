'use client';

import {useEffect, useMemo, useReducer} from 'react';

/**
 * Subscriber is a function that takes a single argument, which is another function `listener` that returns `void`. The Subscriber function itself returns another function that can be used to unsubscribe the `listener`.
 */
export type Subscriber = (listener: () => void) => () => void;

export type SnapshotGetter<T> = () => T;

/**
 * Alternate for `useSyncExternalStore` which runs into infinite loops when hooks are used in `getSnapshot`
 * https://github.com/facebook/react/issues/24529
 */
export function useSyncMemoizedStore<T>(
  subscribe: Subscriber,
  getSnapshot: SnapshotGetter<T>
) {
  let latestSnapshot = useMemo(() => getSnapshot(), [getSnapshot, subscribe]);
  const [, forceRender] = useReducer((s) => s + 1, 0);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribe(() => {
      if (isMounted) {
        latestSnapshot = getSnapshot();
        forceRender();
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [subscribe, getSnapshot]);

  return latestSnapshot;
}
