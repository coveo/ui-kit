import {useId, useRef, useState, useSyncExternalStore} from 'react';
import {
  createOptimisticValue,
  type OptimisticGesture,
  type OptimisticValueController,
} from '@coveo/thermidor';
import {devTrace} from './dev-trace.js';
import {type AppStaleScope, useDispatchProgress} from './pending-dispatch.js';

export type {CoalescePolicy, OptimisticNext, OptimisticTransform} from '@coveo/thermidor';

/**
 * A gesture as this app writes one, pinned to the regions this app names so a misspelled one is
 * not expressible. This is the single door every gesture of the app goes through.
 */
export type AppGesture<T, TAction> = OptimisticGesture<T, TAction, AppStaleScope>;

export interface OptimisticValue<T, TAction> {
  /** What to render: this component's held intention while a gesture is outstanding, else the producer's. */
  value: T;
  /**
   * The state a gesture issued now will be applied to: the producer value plus the single dispatch
   * already sent, which cannot be taken back.
   *
   * A function rather than a value, because it depends on what is on its way RIGHT NOW. Read at
   * the moment of the gesture it guards, it cannot be a render old.
   *
   * `undefined` means it cannot be told — a caller must then not drop anything.
   */
  landingValue: () => T | undefined;
  /** Dispatches the gesture's action and holds its outcome until the producer has answered it. */
  dispatchOptimistic: (gesture: AppGesture<T, TAction>) => void;
}

/**
 * Binds one `@coveo/thermidor` optimistic value to React.
 *
 * It supplies the three things only a React consumer can: an instance identity, a store
 * subscription, and the producer value, which arrives on every render and is the one thing the
 * controller cannot hold. Everything else — holding the gesture and releasing it, the gesture
 * identity, the coalescing declaration, the guard against the request already on its way, the
 * report of a lost action — is framework-agnostic and lives in the package.
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
      // Not devTrace: a lost action has to stay visible in production.
      onActionLost: (message) => console.error(message),
      trace: (...parts) => devTrace('[optimistic]', instanceId, ...parts),
    })
  );

  useSyncExternalStore(controller.subscribe, controller.getVersion, controller.getVersion);

  return {
    value: controller.value(backendValue),
    landingValue: () => controller.landingValue(backendValue),
    dispatchOptimistic: (gesture) => controller.dispatch(backendValue, gesture),
  };
}
