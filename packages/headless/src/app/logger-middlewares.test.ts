import {SchemaValidationError} from '@coveo/bueno';
import {buildMockSearchAppEngine} from '../test';
import {serializeSchemaValidationError} from '../utils/validate-payload';

describe('logActionErrorMiddleware', () => {
  it(`when a action has no error parameter
  it should not log an error`, () => {
    const e = buildMockSearchAppEngine();
    const {dispatch} = e;
    spyOn(e.logger, 'error');

    const action = {type: 'foo'};
    dispatch(action);
    expect(e.logger.error).not.toHaveBeenCalled();
  });

  it(`when a action has a serialized SchemaValidationError
  it should not pass through the middleware`, () => {
    const e = buildMockSearchAppEngine();

    const action = {
      type: 'foo',
      error: serializeSchemaValidationError(
        new SchemaValidationError('no bueno')
      ),
    };
    e.dispatch(action);
    expect(e.actions).not.toContain(action);
  });

  it(`when a action has a serialized Error of any type but SchemaValidationError
  it should pass through the middleware`, () => {
    const e = buildMockSearchAppEngine();

    const action = {
      type: 'foo',
      error: {
        name: 'TypeError',
        message: 'You obviously did something wrong',
      },
    };
    e.dispatch(action);
    expect(e.actions).toContain(action);
  });

  it(`when a action has an error parameter
  it should log an error`, () => {
    const e = buildMockSearchAppEngine();
    spyOn(e.logger, 'error');
    const {dispatch} = e;

    const error = serializeSchemaValidationError(
      new SchemaValidationError('no bueno')
    );
    const action = {
      type: 'foo',
      error,
    };
    dispatch(action);
    expect(e.logger.error).toHaveBeenCalledWith(
      error.stack,
      `Action dispatch error ${action.type}`,
      action
    );
  });
});

describe('logActionMiddleware', () => {
  it(`when a action is dispatched
  it should pass through the middleware and log to debug`, () => {
    const e = buildMockSearchAppEngine();
    spyOn(e.logger, 'debug');
    const {dispatch} = e;

    const action = {type: 'foo'};
    dispatch(action);
    expect(e.logger.debug).toHaveBeenCalledWith(
      {
        action,
        nextState: e.state,
      },
      `Action dispatched: ${action.type}`
    );
  });
});
