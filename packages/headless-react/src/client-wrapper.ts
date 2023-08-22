'use client';

import {useEffect, useReducer, useRef} from 'react';

export {createContext} from 'react';

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
