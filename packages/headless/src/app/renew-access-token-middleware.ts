import type {
  Dispatch,
  Middleware,
  MiddlewareAPI,
  UnknownAction,
} from '@reduxjs/toolkit';
import type {Logger} from 'pino';
import {updateBasicConfiguration} from '../features/configuration/configuration-actions.js';
import {setError} from '../features/error/error-actions.js';
import type {
  CommerceConfigurationSection,
  ConfigurationSection,
} from '../state/state-sections.js';
import {UnauthorizedTokenError} from '../utils/errors.js';
import {shouldRenewJWT as shouldRenewAccessToken} from '../utils/jwt-utils.js';
import {debounce} from '../utils/utils.js';

export function createRenewAccessTokenMiddleware(
  logger: Logger,
  renewToken?: () => Promise<string>
): Middleware {
  let accessTokenRenewalsAttempts = 0;
  let pendingTokenRenewal: Promise<string> | null = null;
  const resetRenewalTriesAfterDelay = debounce(() => {
    accessTokenRenewalsAttempts = 0;
  }, 500);

  const handleTokenRenewal = async (
    store: MiddlewareAPI,
    handleErrors = false
  ): Promise<string | null> => {
    const isTokenRenewalPending = !pendingTokenRenewal;

    if (isTokenRenewalPending && renewToken) {
      pendingTokenRenewal = (async () => {
        if (handleErrors) {
          attempt(renewToken);
        }
        return await renewToken();
      })().finally(() => {
        pendingTokenRenewal = null;
      });
    }

    const accessToken = await pendingTokenRenewal;

    if (isTokenRenewalPending && accessToken) {
      store.dispatch(updateBasicConfiguration({accessToken}));
    }

    return accessToken;
  };

  const handleProactiveTokenRenewal = async (store: MiddlewareAPI) => {
    const state = store.getState();
    const accessToken = getAccessTokenFromState(state);

    if (!accessToken || !shouldRenewAccessToken(accessToken)) {
      return;
    }

    logger.debug(
      'Access token is expired or about to expire, attempting renewal.'
    );

    try {
      const newAccessToken = await handleTokenRenewal(store);
      if (newAccessToken) {
        logger.debug('Access token was renewed.');
      } else {
        logger.warn(
          'Access token renewal returned an empty token. Please check the #renewAccessToken function.'
        );
      }
    } catch (error) {
      logger.warn(
        error,
        'Access token renewal failed. A retry will occur if necessary.'
      );
    }
  };

  const handleExpiredToken = async (
    store: MiddlewareAPI,
    payload: {error: UnauthorizedTokenError},
    action: unknown
  ) => {
    if (accessTokenRenewalsAttempts >= 5) {
      logger.warn(
        'Attempted to renew the token but was not successful. Please check the #renewAccessToken function.'
      );
      dispatchError(store, payload.error);
      return payload;
    }

    accessTokenRenewalsAttempts++;
    resetRenewalTriesAfterDelay();

    await handleTokenRenewal(store, true);
    store.dispatch(action as unknown as UnknownAction);
    return;
  };

  return (store) => (next) => async (action) => {
    const isThunk = typeof action === 'function';
    const hasRenewFunction = typeof renewToken === 'function';

    if (!isThunk) {
      return next(action);
    }

    // Proactive JWT expiration check before action execution
    if (hasRenewFunction) {
      await handleProactiveTokenRenewal(store);
    }

    // Notes:
    //
    // - No race condition with the preceding `handleProactiveTokenRenewal` call because:
    //   1. Token renewal is de-duped: concurrent calls await the same in-flight promise; only the first successful renewal updates the configuration.
    //   2. Dispatch of the new token is synchronous; state is updated before the thunk continues.
    //   3. The state is guaranteed to contain the fresh token before this point is reached.
    //
    // - Execution continues after successful proactive renewal because:
    //   1. The API is the authoritative source for token validity (401/419 responses).
    //   2. Reactive error handling provides defense-in-depth for rare edge cases.
    //   3. This ensures consistent error handling across all action types
    const payload = await next(action);

    if (!isExpiredTokenError(payload)) {
      return payload;
    }

    if (!hasRenewFunction) {
      logger.warn(
        'Unable to renew the expired token because a renew function was not provided. Please specify the #renewAccessToken option when initializing the engine.'
      );
      dispatchError(store, payload.error);
      return payload;
    }

    return await handleExpiredToken(store, payload, action);
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
    (action as any).error?.name === new UnauthorizedTokenError().name
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
  } catch (_) {
    return '';
  }
}

type EngineStateWithAccessToken =
  | (ConfigurationSection & Record<string, unknown>)
  | (CommerceConfigurationSection & Record<string, unknown>);

function getAccessTokenFromState(
  state: EngineStateWithAccessToken
): string | undefined {
  return state.configuration.accessToken;
}
