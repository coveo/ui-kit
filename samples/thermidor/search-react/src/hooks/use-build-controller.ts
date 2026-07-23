import {useCallback, useRef, useSyncExternalStore} from 'react';
import type {Controller} from '@coveo/thermidor';

type StateOf<T> = T extends Controller<infer TState> ? TState : never;

/**
 * Instantiates a controller once (via `useRef`) and subscribes to its state.
 * The subscription is automatically cleaned up by `useSyncExternalStore` on unmount.
 * The controller becomes eligible for garbage collection when the component unmounts.
 *
 * Returns the controller instance, and its reactive state.
 */
export function useBuildController<TController extends Controller<any>>(
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

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return [controller, state];
}
