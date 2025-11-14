import {SchemaValidationError} from '@coveo/bueno';
import type {Logger} from 'pino';
import {serializeSchemaValidationError} from '../utils/validate-payload.js';
import {
  logActionErrorMiddleware,
  logActionMiddleware,
} from './logger-middlewares.js';

const createMiddlewareBoilerplate = () => {
  const logger = {error: vi.fn(), debug: vi.fn()} as unknown as Logger;
  const store = {
    getState: vi.fn(() => {}),
    dispatch: vi.fn(),
  };
  const next = vi.fn();

  return {store, next, logger};
};

const createLogActionErrorMiddleware = () => {
  const {store, next, logger} = createMiddlewareBoilerplate();

  const invoke = (action: unknown) =>
    logActionErrorMiddleware(logger)(store)(next)(action);

  return {store, next, invoke, logger};
};

const createLogActionMiddleware = () => {
  const {store, next, logger} = createMiddlewareBoilerplate();

  const invoke = (action: unknown) =>
    logActionMiddleware(logger)(store)(next)(action);

  return {store, next, invoke, logger};
};

describe('logActionErrorMiddleware', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it(`when a action has no error parameter
  it should not log an error`, () => {
    const {next, logger, invoke} = createLogActionErrorMiddleware();
    invoke({type: 'foo'});
    expect(next).toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it(`when a action has a serialized SchemaValidationError
  it should not pass through the middleware`, () => {
    const {next, logger, invoke} = createLogActionErrorMiddleware();
    invoke({
      type: 'foo',
      error: serializeSchemaValidationError(
        new SchemaValidationError('no bueno')
      ),
    });
    expect(next).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it(`when a action has a serialized Error of any type but SchemaValidationError
  it should pass through the middleware`, () => {
    const {next, logger, invoke} = createLogActionErrorMiddleware();
    invoke({
      type: 'foo',
      error: {
        name: 'TypeError',
        message: 'You obviously did something wrong',
      },
    });
    expect(next).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it(`when a action has an error parameter
  it should log an error`, () => {
    const error = serializeSchemaValidationError(
      new SchemaValidationError('no bueno')
    );
    const action = {
      type: 'foo',
      error,
    };

    const {logger, invoke} = createLogActionErrorMiddleware();
    invoke(action);
    expect(logger.error).toHaveBeenCalledWith(
      {error, action},
      `Action dispatch error ${action.type}`
    );
  });
});

describe('logActionMiddleware', () => {
  it(`when a action is dispatched
  it should pass through the middleware and log to debug`, () => {
    const {logger, invoke} = createLogActionMiddleware();

    const action = {type: 'foo'};
    invoke(action);
    expect(logger.debug).toHaveBeenCalledWith(
      {
        action,
      },
      `Action dispatched: ${action.type}`
    );
  });
});
