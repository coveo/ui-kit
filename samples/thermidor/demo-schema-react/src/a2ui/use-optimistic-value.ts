import {useState} from 'react';
import {useRequestState} from './request-state.js';

export type OptimisticNext<T> = T | ((current: T) => T);

export interface OptimisticGesture<T, TAction> {
  action: TAction;
  next: OptimisticNext<T>;
}

export interface OptimisticValue<T, TAction> {
  /** The held intention until the request in flight ends, else the producer's value. */
  value: T;
  pending: boolean;
  dispatchOptimistic: (gesture: OptimisticGesture<T, TAction>) => void;
}

/**
 * Holds the gesture's value until the next state-changing request ends. The surface is locked
 * meanwhile, so that request is the one this gesture sent.
 */
export function useOptimisticValue<T, TAction>(
  backendValue: T,
  dispatch: (action: TAction) => void
): OptimisticValue<T, TAction> {
  const {settledRequests} = useRequestState();
  const [held, setHeld] = useState<{value: T; settledRequests: number}>();

  const value =
    held !== undefined && held.settledRequests === settledRequests ? held.value : backendValue;

  const dispatchOptimistic = ({action, next}: OptimisticGesture<T, TAction>) => {
    setHeld({
      value: typeof next === 'function' ? (next as (current: T) => T)(value) : next,
      settledRequests,
    });
    dispatch(action);
  };

  return {value, pending: value !== backendValue, dispatchOptimistic};
}
