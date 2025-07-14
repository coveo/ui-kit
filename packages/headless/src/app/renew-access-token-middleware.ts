import type {Middleware, UnknownAction} from '@reduxjs/toolkit';
import type {Logger} from 'pino';
import {debounce} from 'ts-debounce';
import {updateBasicConfiguration} from '../features/configuration/configuration-actions.js';

export function createRenewAccessTokenMiddleware(
  logger: Logger,
  renewToken?: () => Promise<string>
): Middleware {
  let accessTokenRenewalsAttempts = 0;
  const resetRenewalTriesAfterDelay = debounce(() => {
    accessTokenRenewalsAttempts = 0;
  }, 500);

  return (store) => (next) => async (action) => {
    const isThunk = typeof action === 'function';

    if (!isThunk) {
      return next(action);
    }

    const payload = await next(action);

    if (!isUnauthorizedError(payload)) {
      return payload;
    }

    if (typeof renewToken !== 'function') {
      logger.warn(
        'Unable to renew the expired token because a renew function was not provided. Please specify the #renewAccessToken option when initializing the engine.'
      );
      return payload;
    }

    if (accessTokenRenewalsAttempts >= 5) {
      logger.warn(
        'Attempted to renew the token but was not successful. Please check the #renewAccessToken function.'
      );
      return payload;
    }

    accessTokenRenewalsAttempts++;
    resetRenewalTriesAfterDelay();

    const accessToken = await attempt(renewToken);
    store.dispatch(updateBasicConfiguration({accessToken}));
    store.dispatch(action as unknown as UnknownAction);
    return;
  };
}

/**
 * Checks if the `statusCode` property within the action's payload is either
 * `401` (Unauthorized) or `419` (Authentication Timeout/Expired Token).
 *
 * Both `401` and `419` are treated equivalently to ensure consistent handling
 * of unauthorized errors across different APIs, regardless of which status code
 * is used. Handling it here (not in the platform client) allows us to manage
 * the renew access token logic and ensure the error payload bubbles up to the
 * headless state.
 *
 * @param action - The action object potentially containing an error payload.
 * @returns `true` if the action's payload has a `statusCode` of `401` or `419`,
 *          otherwise `false`.
 */
function isUnauthorizedError(action: any) {
  return (
    action?.payload?.statusCode === 401 || action?.payload?.statusCode === 419
  );
}

async function attempt(fn: () => Promise<string>) {
  try {
    return await fn();
  } catch (e) {
    return '';
  }
}
