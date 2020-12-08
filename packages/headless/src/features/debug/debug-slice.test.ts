import {debugReducer} from './debug-slice';
import {enableDebug, disableDebug} from './debug-actions';
import {getDebugInitialState} from './debug-state';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';

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

  describe('#restoreSearchParameters', () => {
    it('when the object contains a #debug key, it sets the value in state', () => {
      expect(debugReducer(false, restoreSearchParameters({debug: true}))).toBe(
        true
      );
    });

    it('when the object does not contain a #debug key, it sets the value in state', () => {
      expect(debugReducer(false, restoreSearchParameters({}))).toBe(false);
    });
  });
});
