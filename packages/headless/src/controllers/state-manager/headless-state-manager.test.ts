import {restoreState} from '../../features/state-manager/state-manager-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockSearchAppEngine, MockEngine} from '../../test';
import {
  buildStateManager,
  StateManager,
  StateManagerProps,
} from './headless-state-manager';

describe('state manager', () => {
  let engine: MockEngine<SearchAppState>;
  let props: StateManagerProps;
  let manager: StateManager;

  function initStateManager() {
    manager = buildStateManager(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    props = {
      initialState: {
        parameters: {},
      },
    };

    initStateManager();
  });

  it('exposes a #subscribe method', () => {
    expect(manager.subscribe).toBeTruthy();
  });

  it('exposes a #parameters property under state', () => {
    expect(manager.state.parameters).toBeTruthy();
  });

  it('dispatches #restoreState on registration', () => {
    const action = restoreState(props.initialState.parameters);
    expect(engine.actions).toContainEqual(action);
  });

  it('when #parameters is not an object, it throws an error', () => {
    props.initialState.parameters = true as never;
    expect(() => initStateManager()).toThrow(
      'Check the initialState of buildStateManager'
    );
  });

  describe('#state.parameters.q', () => {
    it('when #q does not equal the default value, the parameter is included', () => {
      engine.state.query.q = 'a';
      expect(manager.state.parameters.q).toBe('a');
    });

    it('when #q is equal to the default value, the parameter is not included', () => {
      expect('q' in manager.state.parameters).toBe(false);
    });
  });
});
