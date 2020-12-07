import {SchemaValidationError} from '@coveo/bueno';
import {buildMockSearchAppEngine} from '../test';

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

  it(`when a action has an error parameter
  it should not pass through the middleware`, () => {
    const e = buildMockSearchAppEngine();
    const {dispatch, mockStore: store} = e;

    const action = {type: 'foo', error: new SchemaValidationError('no bueno')};
    dispatch(action);
    expect(store.getActions()).not.toContain(action);
  });

  it(`when a action has an error parameter
  it should log an error`, () => {
    const e = buildMockSearchAppEngine();
    spyOn(e.logger, 'error');
    const {dispatch} = e;

    const error = new SchemaValidationError('no bueno');

    const action = {type: 'foo', error};
    dispatch(action);
    expect(e.logger.error).toHaveBeenCalledWith(
      error.message,
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
