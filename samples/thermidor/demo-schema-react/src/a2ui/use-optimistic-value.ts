import {useId, useRef, useState, useSyncExternalStore} from 'react';
import {
  createOptimisticValue,
  type OptimisticGesture,
  type OptimisticValueController,
} from '@coveo/thermidor';
import {devTrace} from './dev-trace.js';
import {type AppStaleScope, useDispatchProgress} from './pending-dispatch.js';

export type {CoalescePolicy, OptimisticNext} from '@coveo/thermidor';

/** Pinned to the app's stale scopes so a misspelled region is a type error. */
type AppGesture<T, TAction> = OptimisticGesture<T, TAction, AppStaleScope>;

export interface OptimisticValue<T, TAction> {
  /** The held intention while a gesture is outstanding, else the producer's value. */
  value: T;
  /** Scoped to this instance, not the app. */
  pending: boolean;
  /**
   * Producer value plus the dispatch already in flight; a function so it is read at gesture time,
   * not a render old. `undefined` means unknown — the caller must then drop nothing.
   */
  landingValue: () => T | undefined;
  dispatchOptimistic: (gesture: AppGesture<T, TAction>) => void;
}

/**
 * Ports are read through a ref, not captured, so the controller never uses the first render's
 * dispatch or queue.
 */
export function useOptimisticValue<T, TAction>(
  backendValue: T,
  dispatch: (action: TAction) => void
): OptimisticValue<T, TAction> {
  const instanceId = useId();
  const progress = useDispatchProgress();
  const latest = useRef({dispatch, progress});
  latest.current = {dispatch, progress};

  const [controller] = useState<OptimisticValueController<T, TAction>>(() =>
    createOptimisticValue<T, TAction>({
      instanceId,
      dispatch: () => latest.current.dispatch,
      queue: () => latest.current.progress,
      onActionLost: (message) => console.error(message),
      trace: (...parts) => devTrace('[optimistic]', instanceId, ...parts),
    })
  );

  useSyncExternalStore(controller.subscribe, controller.getVersion, controller.getVersion);

  const value = controller.value(backendValue);

  return {
    value,
    pending: value !== backendValue,
    landingValue: () => controller.landingValue(backendValue),
    dispatchOptimistic: (gesture) => controller.dispatch(backendValue, gesture),
  };
}
