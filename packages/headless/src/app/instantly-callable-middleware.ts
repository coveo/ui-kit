import {Middleware} from '@reduxjs/toolkit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isInstantlyCallableThunkAction(action: any): action is Function {
  return action.instantlyCallable;
}

/**
 * Makes instantly callable thunk actions dispatchable directly.
 */
export const instantlyCallableThunkActionMiddleware: Middleware =
  () => (next) => (action) =>
    next(isInstantlyCallableThunkAction(action) ? action() : action);
