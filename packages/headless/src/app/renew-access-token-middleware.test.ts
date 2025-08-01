import type {Middleware, MiddlewareAPI} from '@reduxjs/toolkit';
import {type Logger, pino} from 'pino';
import type {Mock} from 'vitest';
import {updateBasicConfiguration} from '../features/configuration/configuration-actions.js';
import {setError} from '../features/error/error-actions.js';
import {UnauthorizedTokenError} from '../utils/errors.js';
import {createRenewAccessTokenMiddleware} from './renew-access-token-middleware.js';

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
      getState: vi.fn(),
    };
  });

  it('when the action is not a function, the middleware returns the payload', async () => {
    const middleware = createRenewAccessTokenMiddleware(logger);
    const action = {a: 'a'};

    const result = await callMiddleware(middleware, action);
    expect(result).toBe(action);
  });

  it('when the action is a function that does not return an expired token error, the middleware returns the payload', async () => {
    const middleware = createRenewAccessTokenMiddleware(logger);
    const action = () => Promise.resolve('a');

    const result = await callMiddleware(middleware, action);
    expect(result).toBe('a');
  });

  it(`when the action is a function that returns an expired token payload,
  when a renew function is not configured,
  it logs a warning and returns the payload`, async () => {
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

  describe(`when the action is a function that returns an expired token payload,
  when a renew function is configured`, () => {
    const payload = buildExpiredTokenPayload();
    const action = () => Promise.resolve(payload);

    beforeEach(async () => {
      const renewFn = () => Promise.resolve('newToken');
      const middleware = createRenewAccessTokenMiddleware(logger, renewFn);

      await callMiddleware(middleware, action);
    });

    it('dispatches an action to update the access token with the value returned by the renew function', () => {
      expect(store.dispatch).toHaveBeenCalledWith(
        updateBasicConfiguration({accessToken: 'newToken'})
      );
    });

    it('dispatches the original action', () => {
      expect(store.dispatch).toHaveBeenCalledWith(action);
    });
  });

  describe(`when the action is a function that returns an expired token payload,
  when a renew function is configured,
  after the second call`, () => {
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

    it('the middleware dispatches the setError action to the store', () => {
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

    it('the middleware logs a warning to check the configured function', () => {
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Please check the #renewAccessToken function.')
      );
    });
  });

  it(`when the action is a function that returns an expired token payload,
  when a renew function is configured,
  if 500ms pass after the second call with no invocations, the middleware dispatches actions on the store on the third call`, async () => {
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
