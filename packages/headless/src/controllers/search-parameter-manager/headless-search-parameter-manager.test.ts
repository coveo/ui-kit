import {restoreSearchParameters} from '../../features/search-parameters/search-parameter-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockSearchAppEngine, MockEngine} from '../../test';
import {
  buildSearchParameterManager,
  SearchParameterManager,
  SearchParameterManagerProps,
} from './headless-search-parameter-manager';

describe('state manager', () => {
  let engine: MockEngine<SearchAppState>;
  let props: SearchParameterManagerProps;
  let manager: SearchParameterManager;

  function initSearchParameterManager() {
    manager = buildSearchParameterManager(engine, props);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    props = {
      initialState: {
        parameters: {},
      },
    };

    initSearchParameterManager();
  });

  it('exposes a #subscribe method', () => {
    expect(manager.subscribe).toBeTruthy();
  });

  it('exposes a #parameters property under state', () => {
    expect(manager.state.parameters).toBeTruthy();
  });

  it('dispatches #restoreSearchParameters on registration', () => {
    const action = restoreSearchParameters(props.initialState.parameters);
    expect(engine.actions).toContainEqual(action);
  });

  it('when #parameters is not an object, it throws an error', () => {
    props.initialState.parameters = true as never;
    expect(() => initSearchParameterManager()).toThrow(
      'Check the initialState of buildSearchParameterManager'
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
