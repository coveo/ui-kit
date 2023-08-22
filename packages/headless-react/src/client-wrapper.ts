'use client';

import {Controller, CoreEngine} from '@coveo/headless';
import {ControllerDefinitionsMap} from '@coveo/headless/ssr';
import {Context, useContext, useEffect, useReducer, useRef} from 'react';
import {ContextState} from './types';

export {useSyncExternalStore, createContext} from 'react';

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
