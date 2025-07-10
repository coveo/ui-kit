import type {Middleware} from '@reduxjs/toolkit';

function isInstantlyCallableThunkAction(action: unknown): action is () => void {
  return (action as {instantlyCallable: boolean}).instantlyCallable;
}

/**
 * Makes instantly callable thunk actions dispatchable directly.
 */
export const instantlyCallableThunkActionMiddleware: Middleware =
  () => (next) => (action) =>
    next(isInstantlyCallableThunkAction(action) ? action() : action);
