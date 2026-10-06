import {useId, useRef, useState, useSyncExternalStore} from 'react';
import {
  createOptimisticValue,
  type OptimisticGesture,
  type OptimisticValueController,
} from '@coveo/thermidor';
import {devTrace} from './dev-trace.js';
import {type AppStaleScope, useDispatchProgress} from './pending-dispatch.js';

export type {CoalescePolicy, OptimisticNext} from '@coveo/thermidor';

/**
 * A gesture as this app writes one, pinned to the regions this app names so a misspelled one is
 * not expressible. This is the single door every gesture of the app goes through.
 */
type AppGesture<T, TAction> = OptimisticGesture<T, TAction, AppStaleScope>;

export interface OptimisticValue<T, TAction> {
  /** What to render: this component's held intention while a gesture is outstanding, else the producer's. */
  value: T;
  /** True while a gesture of THIS value is outstanding; scoped to this instance, not the app. */
  pending: boolean;
  /**
   * The state a gesture issued now will land on: the producer value plus the single dispatch
   * already on its way. A function, not a value, so it is read at the gesture it guards rather than
   * a render old. `undefined` means it cannot be told — the caller must then drop nothing.
   */
  landingValue: () => T | undefined;
  /** Dispatches the gesture's action and holds its outcome until the producer has answered it. */
  dispatchOptimistic: (gesture: AppGesture<T, TAction>) => void;
}

/**
 * Binds one `@coveo/thermidor` optimistic value to React: it supplies the three things only a
 * React consumer can — an instance identity, a store subscription, and the producer value, which
 * arrives every render and is the one thing the controller cannot hold. The rest is in the package.
 *
 * The ports are read through a ref rather than captured, so the controller never answers with the
 * dispatch or the queue of the first render.
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
