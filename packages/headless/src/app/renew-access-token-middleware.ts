import type {
  Dispatch,
  Middleware,
  MiddlewareAPI,
  UnknownAction,
} from '@reduxjs/toolkit';
import type {Logger} from 'pino';
import {debounce} from 'ts-debounce';
import {updateBasicConfiguration} from '../features/configuration/configuration-actions.js';
import {setError} from '../features/error/error-actions.js';
import {UnauthorizedTokenError} from '../utils/errors.js';

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

    if (!isExpiredTokenError(payload)) {
      return payload;
    }

    if (typeof renewToken !== 'function') {
      logger.warn(
        'Unable to renew the expired token because a renew function was not provided. Please specify the #renewAccessToken option when initializing the engine.'
      );
      dispatchError(store, payload.error);
      return payload;
    }

    if (accessTokenRenewalsAttempts >= 5) {
      logger.warn(
        'Attempted to renew the token but was not successful. Please check the #renewAccessToken function.'
      );
      dispatchError(store, payload.error);
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

function isExpiredTokenError(
  action: unknown
): action is {error: UnauthorizedTokenError} {
  return (
    typeof action === 'object' &&
    action !== null &&
    'error' in action &&
    // biome-ignore lint/suspicious/noExplicitAny: any action is possible here.
    (action as any).error?.name === UnauthorizedTokenError.name
  );
}

function dispatchError(
  // biome-ignore lint/suspicious/noExplicitAny: any action is possible here.
  store: MiddlewareAPI<Dispatch<UnknownAction>, any>,
  error: UnauthorizedTokenError
) {
  store.dispatch(
    setError({
      status: 401,
      statusCode: 401,
      message: error.message,
      type: error.name,
    })
  );
}

async function attempt(fn: () => Promise<string>) {
  try {
    return await fn();
  } catch (e) {
    return '';
  }
}
