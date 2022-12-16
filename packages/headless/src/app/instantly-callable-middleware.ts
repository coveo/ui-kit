import {Middleware} from 'redux';

function isInstantlyCallableThunkAction(action: any): boolean {
  return action.instantlyCallable;
}

/**
 * Makes instantly callable thunk actions dispatchable directly.
 */
export const instantlyCallableThunkActionMiddleware: Middleware =
  () => (next) => (action) =>
    next(isInstantlyCallableThunkAction(action) ? action() : action);
