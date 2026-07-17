import {useRef, useSyncExternalStore} from 'react';
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

  const state = useSyncExternalStore<StateOf<TController>>(
    (onStoreChange) => controller.subscribe(onStoreChange),
    () => controller.state,
    () => controller.state
  );

  return [controller, state];
}
