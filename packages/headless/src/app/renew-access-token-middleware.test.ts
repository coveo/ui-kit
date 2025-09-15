import type {Middleware, MiddlewareAPI} from '@reduxjs/toolkit';
import {type Logger, pino} from 'pino';
import type {Mock} from 'vitest';
import {updateBasicConfiguration} from '../features/configuration/configuration-actions.js';
import {setError} from '../features/error/error-actions.js';
import {UnauthorizedTokenError} from '../utils/errors.js';
import {createRenewAccessTokenMiddleware} from './renew-access-token-middleware.js';

vi.mock('../utils/jwt-utils.js', () => ({
  shouldRenewJWT: vi.fn(),
}));

describe('createRenewAccessTokenMiddleware', () => {
  let logger: Logger;
  let store: MiddlewareAPI;

  async function callMiddleware(middleware: Middleware, action: unknown) {
    return await middleware(store)(buildDispatch())(action);
  }

  function buildExpiredTokenPayload() {
    return {
      error: {
        name: new UnauthorizedTokenError().name,
        message: new UnauthorizedTokenError().message,
      },
    };
  }

  function buildDispatch() {
    return vi.fn((action: unknown) =>
      typeof action === 'function' ? action() : action
    );
  }

  function buildArrayWithLengthEqualToNumberOfRetries() {
    return new Array(5).fill(0);
  }

  beforeEach(() => {
    logger = pino({level: 'silent'});
    store = {
      dispatch: buildDispatch(),
      getState: vi.fn().mockReturnValue({
        configuration: {
          accessToken: 'test-jwt-token',
        },
      }),
    };
    vi.clearAllMocks();
  });

  it('should return the payload when the action is not a function', async () => {
    const middleware = createRenewAccessTokenMiddleware(logger);
    const action = {a: 'a'};

    const result = await callMiddleware(middleware, action);
    expect(result).toBe(action);
  });

  it('should proactively renew token when JWT is expired', async () => {
    const {shouldRenewJWT} = await import('../utils/jwt-utils.js');
    (shouldRenewJWT as Mock).mockReturnValue(true);
    logger.debug = vi.fn();

    const renewFn = vi.fn().mockResolvedValue('new-token');
    const middleware = createRenewAccessTokenMiddleware(logger, renewFn);
    const action = vi.fn().mockResolvedValue('result');

    await callMiddleware(middleware, action);

    expect(shouldRenewJWT).toHaveBeenCalledWith('test-jwt-token');
    expect(renewFn).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(
      updateBasicConfiguration({accessToken: 'new-token'})
    );
    expect(logger.debug).toHaveBeenCalledWith('Access token was renewed.');
  });

  it('should not attempt renewal when JWT is not expired', async () => {
    const {shouldRenewJWT} = await import('../utils/jwt-utils.js');
    (shouldRenewJWT as Mock).mockReturnValue(false);

    const renewFn = vi.fn();
    const middleware = createRenewAccessTokenMiddleware(logger, renewFn);
    const action = vi.fn().mockResolvedValue('result');

    await callMiddleware(middleware, action);

    expect(shouldRenewJWT).toHaveBeenCalledWith('test-jwt-token');
    expect(renewFn).not.toHaveBeenCalled();
  });

  it('should handle proactive renewal failure gracefully', async () => {
    const {shouldRenewJWT} = await import('../utils/jwt-utils.js');
    (shouldRenewJWT as Mock).mockReturnValue(true);
    logger.warn = vi.fn();

    const renewFn = vi.fn().mockRejectedValue(new Error('Renewal failed'));
    const middleware = createRenewAccessTokenMiddleware(logger, renewFn);
    const action = vi.fn().mockResolvedValue('result');

    await callMiddleware(middleware, action);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.any(Error),
      'Access token renewal failed. A retry will occur if necessary.'
    );
  });
  it('should only call updateBasicConfiguration once when calling the middleware multiple times in a row', async () => {
    const {shouldRenewJWT} = await import('../utils/jwt-utils.js');
    (shouldRenewJWT as Mock).mockReturnValue(true);
    logger.debug = vi.fn();

    const renewFn = vi.fn().mockResolvedValue('new-token');
    const middleware = createRenewAccessTokenMiddleware(logger, renewFn);
    const action = vi.fn().mockResolvedValue('result');

    const array = buildArrayWithLengthEqualToNumberOfRetries();
    const promises = array.map(() => callMiddleware(middleware, action));
    await Promise.all(promises);

    expect(store.dispatch).toHaveBeenCalledExactlyOnceWith(
      updateBasicConfiguration({accessToken: 'new-token'})
    );

    expect(logger.debug).toHaveBeenCalledWith('Access token was renewed.');
  });

  it('should handle empty renewal result', async () => {
    const {shouldRenewJWT} = await import('../utils/jwt-utils.js');
    (shouldRenewJWT as Mock).mockReturnValue(true);
    logger.warn = vi.fn();

    const renewFn = vi.fn().mockResolvedValue('');
    const middleware = createRenewAccessTokenMiddleware(logger, renewFn);
    const action = vi.fn().mockResolvedValue('result');

    await callMiddleware(middleware, action);

    expect(logger.warn).toHaveBeenCalledWith(
      'Access token renewal returned an empty token. Please check the #renewAccessToken function.'
    );
  });

  it('should return the payload when the action is a function that does not return an expired token error', async () => {
    const middleware = createRenewAccessTokenMiddleware(logger);
    const action = () => Promise.resolve('a');

    const result = await callMiddleware(middleware, action);
    expect(result).toBe('a');
  });

  it('should log a warning and return the payload when the action returns an expired token payload and no renew function is configured', async () => {
    const payload = buildExpiredTokenPayload();
    const action = () => Promise.resolve(payload);
    const middleware = createRenewAccessTokenMiddleware(logger);
    logger.warn = vi.fn();

    const result = await callMiddleware(middleware, action);

    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Please specify the #renewAccessToken option')
    );
    expect(result).toBe(payload);
  });

  describe('when the action returns an expired token payload and a renew function is configured', () => {
    const payload = buildExpiredTokenPayload();
    const action = () => Promise.resolve(payload);

    beforeEach(async () => {
      const renewFn = () => Promise.resolve('newToken');
      const middleware = createRenewAccessTokenMiddleware(logger, renewFn);

      await callMiddleware(middleware, action);
    });

    it('should dispatch an action to update the access token with the value returned by the renew function', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateBasicConfiguration({accessToken: 'newToken'})
      );
    });

    it('should dispatch the original action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });

  describe('when the action returns an expired token payload, a renew function is configured, and after the second call', () => {
    beforeEach(async () => {
      const payload = buildExpiredTokenPayload();
      const action = () => Promise.resolve(payload);
      const renewFn = () => Promise.resolve('newToken');
      logger.warn = vi.fn();

      const middleware = createRenewAccessTokenMiddleware(logger, renewFn);

      const array = buildArrayWithLengthEqualToNumberOfRetries();
      const promises = array.map(() => callMiddleware(middleware, action));
      await Promise.all(promises);

      (store.dispatch as Mock).mockReset();

      await callMiddleware(middleware, action);
    });

    it('should dispatch the setError action to the store', () => {
      const error = new UnauthorizedTokenError();
      expect(store.dispatch).toHaveBeenCalledWith(
        setError({
          status: 401,
          statusCode: 401,
          message: error.message,
          type: error.name,
        })
      );
    });

    it('should log a warning to check the configured function', () => {
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Please check the #renewAccessToken function.')
      );
    });
  });

  it('should dispatch actions on the store on the third call when 500ms pass after the second call with no invocations', async () => {
    const payload = buildExpiredTokenPayload();
    const action = () => Promise.resolve(payload);
    const renewFn = () => Promise.resolve('newToken');

    const middleware = createRenewAccessTokenMiddleware(logger, renewFn);

    vi.useFakeTimers();
    const array = buildArrayWithLengthEqualToNumberOfRetries();
    const promises = array.map(() => callMiddleware(middleware, action));
    await Promise.all(promises);

    (store.dispatch as Mock).mockReset();

    vi.advanceTimersByTime(500);
    await callMiddleware(middleware, action);

    expect(store.dispatch).toHaveBeenCalled();
  });
});
