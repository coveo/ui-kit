import {debugReducer} from './debug-slice';
import {enableDebug, disableDebug} from './debug-actions';
import {getDebugInitialState} from './debug-state';

describe('debug slice', () => {
  it('should have initial state', () => {
    expect(debugReducer(undefined, {type: 'randomAction'})).toEqual(
      getDebugInitialState()
    );
  });

  it('allows to enable debug', () => {
    expect(debugReducer(false, enableDebug())).toBe(true);
  });

  it('allows to disable debug', () => {
    expect(debugReducer(true, disableDebug())).toBe(false);
  });
});
