import {Middleware} from 'redux';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isInstantlyCallableThunkAction(action: any): boolean {
  return action.instantlyCallable;
}

/**
 * Makes instantly callable thunk actions dispatchable directly.
 */
export const instantlyCallableThunkActionMiddleware: Middleware =
  () => (next) => (action) =>
    next(isInstantlyCallableThunkAction(action) ? action() : action);
