import {Middleware} from '@reduxjs/toolkit';
import {Logger} from 'pino';
import {debounce} from 'ts-debounce';
import {updateBasicConfiguration} from '../features/configuration/configuration-actions';
import {ExpiredTokenError} from '../utils/errors';

export function createRenewAccessTokenMiddleware(
  logger: Logger,
  renewToken?: () => Promise<string>
): Middleware {
  let accessTokenRenewalsAttempts = 0;
  const resetRenewalTriesAfterDelay = debounce(
    () => (accessTokenRenewalsAttempts = 0),
    500
  );

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
    store.dispatch(action);
  };
}

function isExpiredTokenError(action: any) {
  return action.error?.name === new ExpiredTokenError().name;
}

async function attempt(fn: () => Promise<string>) {
  try {
    return await fn();
  } catch (e) {
    return '';
  }
}
