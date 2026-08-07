import {useCallback, useRef, useSyncExternalStore} from 'react';
import type {Controller} from '@coveo/thermidor';

type StateOf<T> = T extends Controller<infer TState> ? TState : never;

export function useController<TController extends Controller<unknown>>(
  factory: () => TController
): [TController, StateOf<TController>] {
  const controllerRef = useRef<TController | null>(null);
  controllerRef.current ??= factory();
  const controller = controllerRef.current;

  const subscribe = useCallback(
    (onStoreChange: () => void) => controller.subscribe(onStoreChange),
    [controller]
  );
  const getSnapshot = useCallback(() => controller.state as StateOf<TController>, [controller]);

  return [controller, useSyncExternalStore(subscribe, getSnapshot, getSnapshot)];
}
