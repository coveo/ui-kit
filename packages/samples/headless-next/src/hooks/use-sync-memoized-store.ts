import {DependencyList} from 'react';
import {useEffect, useReducer, useRef} from './wrapped';

function useHasChanged(deps: DependencyList) {
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

function useRefWithCallbackInitialState<T>(getInitialState: () => T) {
  const initialValueIsSet = useRef(false);
  const ref = useRef(null as T);
  !initialValueIsSet.current && (ref.current = getInitialState());
  initialValueIsSet.current = true;
  return ref;
}

/**
 * Same as [useSyncExternalStore](https://reactjs.org/docs/hooks-reference.html#usesyncexternalstore), but doesn't infinitely re-render with a memoized store.
 */
export function useSyncMemoizedStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T
) {
  const state = useRefWithCallbackInitialState<T>(getSnapshot);
  const [, rerender] = useReducer((renderCount: number) => renderCount + 1, 0);
  useEffect(
    () => {
      let canRerender = false;
      const unsubscribe = subscribe(() => {
        if (!canRerender) {
          return;
        }
        state.current = getSnapshot();
        rerender();
      });
      canRerender = true;
      return unsubscribe;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [subscribe]
  );
  if (useHasChanged([getSnapshot])) {
    state.current = getSnapshot();
  }
  return state.current as T;
}
