'use client';

import {useEffect, useReducer, useRef} from 'react';

/**
 * Alternate for `useSyncExternalStore` which runs into infinite loops when hooks are used in `getSnapshot`
 * https://github.com/facebook/react/issues/24529
 */
export function useSyncMemoizedStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T
) {
  const stateRef = useRef(getSnapshot());
  const [, forceRender] = useReducer((s) => s + 1, 0);

  useEffect(() => {
    let isMounted = true;
    const unsubscribe = subscribe(() => {
      if (isMounted) {
        stateRef.current = getSnapshot();
        forceRender();
      }
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [subscribe, getSnapshot]);

  return stateRef.current;
}
