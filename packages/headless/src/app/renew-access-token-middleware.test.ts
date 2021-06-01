import {createRenewAccessTokenMiddleware} from './renew-access-token-middleware';
import pino, {Logger} from 'pino';
import {Middleware, MiddlewareAPI} from 'redux';
import {ExpiredTokenError} from '../utils/errors';
import {updateBasicConfiguration} from '../features/configuration/configuration-actions';

describe('createRenewAccessTokenMiddleware', () => {
  let logger: Logger;
  let store: MiddlewareAPI;

  async function callMiddleware(middleware: Middleware, action: any) {
    return await middleware(store)(buildDispatch())(action);
  }

  function buildExpiredTokenPayload() {
    return {
      error: {name: new ExpiredTokenError().name},
    };
  }

  function buildDispatch() {
    return jest.fn((action: any) =>
      typeof action === 'function' ? action() : action
    );
  }

  beforeEach(() => {
    logger = pino({level: 'silent'});
    store = {
      dispatch: buildDispatch(),
      getState: jest.fn(),
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
    logger.warn = jest.fn();

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
      logger.warn = jest.fn();

      const middleware = createRenewAccessTokenMiddleware(logger, renewFn);

      await callMiddleware(middleware, action);
      await callMiddleware(middleware, action);

      (store.dispatch as jest.Mock).mockReset();

      await callMiddleware(middleware, action);
    });

    it('the middleware stops dispatching actions on the store to prevent an infinite loop', () => {
      expect(store.dispatch).not.toHaveBeenCalled();
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

    jest.useFakeTimers();
    await callMiddleware(middleware, action);
    await callMiddleware(middleware, action);

    (store.dispatch as jest.Mock).mockReset();

    jest.runTimersToTime(500);
    await callMiddleware(middleware, action);

    expect(store.dispatch).toHaveBeenCalled();
  });
});
