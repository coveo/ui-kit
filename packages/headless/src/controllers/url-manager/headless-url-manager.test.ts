import {configuration} from '../../app/common-reducers';
import {
  restoreSearchParameters,
  SearchParameters,
} from '../../features/search-parameters/search-parameter-actions';
import {initialSearchParameterSelector} from '../../features/search-parameters/search-parameter-selectors';
import {executeSearch} from '../../features/search/search-actions';
import {MockSearchEngine} from '../../test/mock-engine';
import {buildMockSearchAppEngine} from '../../test/mock-engine';
import {UrlManager, buildUrlManager} from './headless-url-manager';

describe('url manager', () => {
  let engine: MockSearchEngine;
  let manager: UrlManager;

  function initUrlManager(fragment = '') {
    manager = buildUrlManager(engine, {
      initialState: {
        fragment,
      },
    });
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initUrlManager();
  });

  function getLastestRestoreSearchParametersAction() {
    const restoreSearchParametersActions = engine.actions.filter(
      (action) => action.type === restoreSearchParameters.type
    );
    return restoreSearchParametersActions[
      restoreSearchParametersActions.length - 1
    ];
  }

  function testLatestRestoreSearchParameters(params: SearchParameters) {
    const action = restoreSearchParameters(params);
    expect(getLastestRestoreSearchParametersAction()).toEqual(action);
  }

  function testExecuteSearch() {
    expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
  }

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('dispatches #restoreSearchParameters on registration', () => {
    expect(getLastestRestoreSearchParametersAction()).toBeTruthy();
  });

  it('does not execute a search on registration', () => {
    expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
  });

  it('initial #restoreSearchParameters should parse the "active" fragment', () => {
    initUrlManager('q=windmill&f-author=Cervantes');
    testLatestRestoreSearchParameters({
      q: 'windmill',
      f: {author: ['Cervantes']},
    });
  });

  it('returns the serialized fragment of the search parameters state', () => {
    engine.state.query.q = 'books';
    engine.state.sortCriteria = 'author ascending';
    expect(manager.state.fragment).toBe(
      `q=books&sortCriteria=author${encodeURIComponent(' ')}ascending`
    );
  });

  describe('synchronize with parameter', () => {
    it(`when adding a parameter
    should restore the right parameters and execute a search`, () => {
      manager.synchronize('q=test');

      testLatestRestoreSearchParameters({
        ...initialSearchParameterSelector(engine.state),
        q: 'test',
      });
      testExecuteSearch();
    });

    it(`when removing a parameter
    should restore the right parameters and execute a search`, () => {
      engine.state.query.q = 'test';
      manager.synchronize('');

      testLatestRestoreSearchParameters(
        initialSearchParameterSelector(engine.state)
      );
      testExecuteSearch();
    });

    it(`when the fragment is unchanged
    should not execute a search`, () => {
      engine.state.query.q = 'test';
      manager.synchronize('q=test');

      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });

    it(`when a parameter's value changes
    should restore the right parameters and execute a search`, () => {
      engine.state.query.q = 'books';
      manager.synchronize('q=movies');

      testLatestRestoreSearchParameters({
        ...initialSearchParameterSelector(engine.state),
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

    it('should not call listener when initially subscribing', () => {
      const listener = jest.fn();
      manager.subscribe(listener);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should not call listener when only the requestId changes', () => {
      const listener = jest.fn();
      manager.subscribe(listener);

      engine.state.search.requestId = 'abcde';
      callListener();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should not call listener when only a fragment value modified', () => {
      const listener = jest.fn();
      manager.subscribe(listener);

      engine.state.query.q = 'albums';
      callListener();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should call listener when a fragment value is added and the requestId has changed', () => {
      const listener = jest.fn();
      manager.subscribe(listener);

      engine.state.search.requestId = 'abcde';
      engine.state.query.q = 'books';
      callListener();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should call listener when a fragment value is removed and the requestId has changed', () => {
      initUrlManager('q=movies');

      const listener = jest.fn();
      manager.subscribe(listener);

      engine.state.search.requestId = 'abcde';
      engine.state.query.q = '';
      callListener();

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
