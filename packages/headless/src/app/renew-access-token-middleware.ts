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
import {shouldRenewJWT as shouldRenewAccessToken} from '../utils/jwt-utils.js';

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

    const hasRenewFunction = typeof renewToken === 'function';

    // Proactive JWT expiration check before action execution
    if (hasRenewFunction) {
      const state = store.getState();
      const accessToken = getAccessTokenFromState(state);

      if (accessToken && shouldRenewAccessToken(accessToken)) {
        logger.debug(
          'Access token is expired or about to expire, attempting renewal'
        );
        try {
          const newAccessToken = await renewToken();
          if (newAccessToken) {
            store.dispatch(
              updateBasicConfiguration({accessToken: newAccessToken})
            );
            logger.debug('Access token was renewed');
          } else {
            logger.warn(
              'Access token renewal returned an empty token. Please check the #renewAccessToken function.'
            );
          }
        } catch (error) {
          logger.warn(
            error,
            'Access token renewal failed, will retry on failure if needed'
          );
        }
      }
    }

    // Note: No race condition with updateBasicConfiguration dispatch above because:
    // 1. store.dispatch() with synchronous actions completes immediately and updates state
    // 2. The state is guaranteed to contain the fresh token before we reach this point
    //
    // We don't short-circuit execution after successful proactive renewal because:
    // 1. The API server is the authoritative source for token validation (401/419 responses)
    // 2. Reactive error handling provides defense-in-depth for edge cases
    // 3. Ensures consistent error handling across all action types
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

/**
 * Extracts the access token from different possible state structures.
 * This function handles various engine state formats:
 * - Search engine: state.configuration.accessToken
 * - Commerce engine: state.commerceContext.accessToken
 * - Other engines: state.accessToken
 *
 * @param state - Redux state from any engine type
 * @returns The access token string or undefined if not found
 */
// biome-ignore lint/suspicious/noExplicitAny: State structure varies between engine types, runtime safety provided by optional chaining
function getAccessTokenFromState(state: any): string | undefined {
  // Handle different state structures across engine types
  return (
    state?.configuration?.accessToken ||
    state?.commerceContext?.accessToken ||
    state?.accessToken
  );
}
