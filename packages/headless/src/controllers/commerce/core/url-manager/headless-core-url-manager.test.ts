import {configuration} from '../../../../app/common-reducers';
import {
  CommerceSearchParameters,
  restoreSearchParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {searchSerializer} from '../../../../features/commerce/search-parameters/search-parameter-serializer';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildSearchParameterManager} from '../../search/parameter-manager/headless-search-parameter-manager';
import {buildCoreUrlManager, UrlManager} from './headless-core-url-manager';

describe('core url manager', () => {
  let engine: MockCommerceEngine;
  let manager: UrlManager;

  function initUrlManager(fragment = '') {
    manager = buildCoreUrlManager(engine, {
      initialState: {
        fragment,
      },
      requestIdSelector: (state) => state.commerceSearch.requestId,
      parameterManagerBuilder: buildSearchParameterManager,
      serializer: searchSerializer,
    });
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    initUrlManager();
  });

  function getLatestRestoreSearchParametersAction() {
    const restoreSearchParametersActions = engine.actions.filter(
      (action) => action.type === restoreSearchParameters.type
    );
    return restoreSearchParametersActions[
      restoreSearchParametersActions.length - 1
    ];
  }

  function testLatestRestoreSearchParameters(params: CommerceSearchParameters) {
    const action = restoreSearchParameters(params);
    expect(getLatestRestoreSearchParametersAction()).toEqual(action);
  }

  function testExecuteSearch() {
    expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
  }

  describe('initialization', () => {
    it('adds the correct reducers to the engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({configuration});
    });

    it('dispatches #restoreSearchParameters', () => {
      expect(getLatestRestoreSearchParametersAction()).toBeTruthy();
    });

    it('does not execute a search', () => {
      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });

    it('initial #restoreActionCreator should parse the "active" fragment', () => {
      initUrlManager('q=windmill');
      testLatestRestoreSearchParameters({
        q: 'windmill',
      });
    });
  });

  describe('state', () => {
    it('contains the serialized fragment of the search parameters state', () => {
      engine.state.commerceQuery.query = 'books';
      expect(manager.state.fragment).toBe('q=books');
    });
  });

  describe('#synchronize', () => {
    it(`when adding a parameter
    should restore the right parameters and execute a search`, () => {
      manager.synchronize('q=test');
      testLatestRestoreSearchParameters({
        q: 'test',
      });
      testExecuteSearch();
    });

    it(`when removing a parameter
    should restore the right parameters and execute a search`, () => {
      engine.state.commerceQuery.query = 'test';
      manager.synchronize('');

      testLatestRestoreSearchParameters({});
      testExecuteSearch();
    });

    it(`when the fragment is unchanged
    should not execute a search`, () => {
      engine.state.commerceQuery.query = 'test';
      manager.synchronize('q=test');

      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });

    it(`when a parameter's value changes
    should restore the right parameters and execute a search`, () => {
      engine.state.commerceQuery.query = 'books';
      manager.synchronize('q=movies');

      testLatestRestoreSearchParameters({
        q: 'movies',
      });
      testExecuteSearch();
    });
  });

  describe('#subscribe', () => {
    function callListener() {
      return (engine.subscribe as jest.Mock).mock.calls.map(
        (args) => args[0]
      )[0]();
    }

    describe('should not call listener', () => {
      it('when initially subscribing', () => {
        const listener = jest.fn();
        manager.subscribe(listener);

        expect(listener).not.toHaveBeenCalled();
      });

      it('when only the requestId changes', () => {
        const listener = jest.fn();
        manager.subscribe(listener);

        engine.state.commerceSearch.requestId = 'abcde';
        callListener();

        expect(listener).not.toHaveBeenCalled();
      });

      it('when only a fragment value is modified', () => {
        const listener = jest.fn();
        manager.subscribe(listener);

        engine.state.commerceQuery.query = 'albums';
        callListener();

        expect(listener).not.toHaveBeenCalled();
      });
    });

    describe('should call listener', () => {
      it('when a fragment value is added and the requestId has changed', () => {
        const listener = jest.fn();
        manager.subscribe(listener);

        engine.state.commerceSearch.requestId = 'abcde';
        engine.state.commerceQuery.query = 'books';
        callListener();

        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('when a fragment value is removed and the requestId has changed', () => {
        initUrlManager('q=movies');

        const listener = jest.fn();
        manager.subscribe(listener);

        engine.state.commerceSearch.requestId = 'abcde';
        engine.state.commerceQuery.query = '';
        callListener();

        expect(listener).toHaveBeenCalledTimes(1);
      });
    });
  });
});
