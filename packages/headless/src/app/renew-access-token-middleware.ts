import type {Dispatch, Middleware, MiddlewareAPI, UnknownAction} from '@reduxjs/toolkit';
import type {Logger} from 'pino';
import {updateBasicConfiguration} from '../features/configuration/configuration-actions.js';
import {setError} from '../features/error/error-actions.js';
import type {CommerceConfigurationSection, ConfigurationSection} from '../state/state-sections.js';
import {UnauthorizedTokenError} from '../utils/errors.js';
import {shouldRenewJWT as shouldRenewAccessToken} from '../utils/jwt-utils.js';
import {debounce} from '../utils/utils.js';

export function createRenewAccessTokenMiddleware(
  logger: Logger,
  renewToken?: () => Promise<string>
): Middleware {
  let accessTokenRenewalsAttempts = 0;
  let pendingTokenRenewal: Promise<string | null> | null = null;
  const resetRenewalTriesAfterDelay = debounce(() => {
    accessTokenRenewalsAttempts = 0;
  }, 500);

  const handleTokenRenewal = async (
    store: MiddlewareAPI,
    handleErrors = false
  ): Promise<string | null> => {
    const shouldInitiateRenewal = !pendingTokenRenewal;

    if (shouldInitiateRenewal && renewToken) {
      pendingTokenRenewal = (async () => {
        try {
          return await renewToken();
        } catch (error) {
          if (!handleErrors) {
            throw error;
          }
          return null;
        }
      })().finally(() => {
        pendingTokenRenewal = null;
      });
    }

    const accessToken = await pendingTokenRenewal;

    if (shouldInitiateRenewal && accessToken) {
      store.dispatch(updateBasicConfiguration({accessToken}));
    }

    return accessToken;
  };

  const shouldProactivelyRenewToken = (store: MiddlewareAPI) => {
    const accessToken = getAccessTokenFromState(store.getState());
    return !!accessToken && shouldRenewAccessToken(accessToken);
  };

  const handleProactiveTokenRenewal = async (store: MiddlewareAPI) => {
    logger.debug('Access token is expired or about to expire, attempting renewal.');

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
      logger.warn(error, 'Access token renewal failed. A retry will occur if necessary.');
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

    const isInitiator = !pendingTokenRenewal;
    if (isInitiator) {
      accessTokenRenewalsAttempts++;
      resetRenewalTriesAfterDelay();
    }

    try {
      await handleTokenRenewal(store, true);
    } catch (error) {
      logger.debug(
        error,
        'Token renewal failed in reactive path (piggybacked on a proactive renewal). The action will be re-dispatched.'
      );
    }
    store.dispatch(action as unknown as UnknownAction);
    return;
  };

  /**
   * Inspects a resolved action result for an expired-token error and triggers
   * reactive renewal when needed. Otherwise returns the result unchanged.
   */
  const handleResolvedActionResult = (
    store: MiddlewareAPI,
    action: unknown,
    actionResult: unknown
  ): unknown => {
    if (!isExpiredTokenError(actionResult)) {
      return actionResult;
    }

    if (!renewToken) {
      logger.warn(
        'Unable to renew the expired token because a renew function was not provided. Please specify the #renewAccessToken option when initializing the engine.'
      );
      dispatchError(store, actionResult.error);
      return actionResult;
    }

    return handleExpiredToken(store, actionResult, action);
  };

  /**
   * Routes an action result to `handleResolvedActionResult` without changing its synchronous or
   * asynchronous nature: a synchronous result is handled immediately, a Promise result is handled
   * once it resolves.
   */
  const handleActionResult = (
    store: MiddlewareAPI,
    action: unknown,
    actionResult: unknown
  ): unknown => {
    if (isPromiseLike(actionResult)) {
      return Promise.resolve(actionResult).then((resolvedActionResult) =>
        handleResolvedActionResult(store, action, resolvedActionResult)
      );
    }

    return handleResolvedActionResult(store, action, actionResult);
  };

  return (store) => (next) => (action) => {
    const isThunk = typeof action === 'function';
    if (!isThunk) {
      return next(action);
    }

    const executeAction = () => handleActionResult(store, action, next(action));
    const shouldRenew = typeof renewToken === 'function' && shouldProactivelyRenewToken(store);

    if (!shouldRenew) {
      return executeAction();
    }

    // Concurrent calls share the same in-flight renewal (deduped), and only the initiating
    // call updates the configuration once renewal succeeds. That update is dispatched
    // synchronously, so by the time `executeAction` runs below, the state already has the new
    // token, if renewal succeeded. If renewal failed or returned no token, execution still
    // continues: the API is the authoritative source for token validity, so an unauthorized
    // response can still trigger reactive renewal afterward.
    return handleProactiveTokenRenewal(store).then(executeAction);
  };
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

function isExpiredTokenError(action: unknown): action is {error: UnauthorizedTokenError} {
  return (
    typeof action === 'object' &&
    action !== null &&
    'error' in action &&
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- any action is possible here.
    (action as any).error?.name === new UnauthorizedTokenError().name
  );
}

function dispatchError(
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any -- any action is possible here.
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

type EngineStateWithAccessToken =
  | (ConfigurationSection & Record<string, unknown>)
  | (CommerceConfigurationSection & Record<string, unknown>);

function getAccessTokenFromState(state: EngineStateWithAccessToken): string | undefined {
  return state.configuration.accessToken;
}
