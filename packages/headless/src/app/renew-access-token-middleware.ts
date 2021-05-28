import {Middleware} from '@reduxjs/toolkit';
import {debounce} from 'ts-debounce';
import {updateBasicConfiguration} from '../features/configuration/configuration-actions';
import {ExpiredTokenError} from '../utils/errors';

export function createRenewAccessTokenMiddleware(
  renewToken: () => Promise<string>
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

    if (!hasExpiredTokenError(payload)) {
      return payload;
    }

    accessTokenRenewalsAttempts++;
    resetRenewalTriesAfterDelay();

    if (accessTokenRenewalsAttempts > 5) {
      return payload;
    }

    const accessToken = await attempt(renewToken);

    if (!accessToken) {
      return payload;
    }

    store.dispatch(updateBasicConfiguration({accessToken}));
    return next(action);
  };
}

function hasExpiredTokenError(action: any) {
  return action.error?.name === new ExpiredTokenError().name;
}

async function attempt(fn: () => Promise<string>) {
  try {
    return await fn();
  } catch (e) {
    return '';
  }
}
