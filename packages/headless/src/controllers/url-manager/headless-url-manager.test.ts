import {configuration} from '../../app/reducers';
import {
  restoreSearchParameters,
  SearchParameters,
} from '../../features/search-parameters/search-parameter-actions';
import {initialSearchParameterSelector} from '../../features/search-parameters/search-parameter-selectors';
import {executeSearch} from '../../features/search/search-actions';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockSearchAppEngine, MockEngine} from '../../test';
import {UrlManager, buildUrlManager} from './headless-url-manager';

describe('url manager', () => {
  let engine: MockEngine<SearchAppState>;
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
    initUrlManager('q=windmill&f[author]=Cervantes');
    testLatestRestoreSearchParameters({
      q: 'windmill',
      f: {author: ['Cervantes']},
    });
  });

  it('returns the serialized fragment of the search parameters state', () => {
    engine.state.query.q = 'books';
    engine.state.sortCriteria = 'author ascending';
    expect(manager.state.fragment).toBe(
      'q=books&sortCriteria=author ascending'
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
      initUrlManager('q=test');
      manager.synchronize('');

      testLatestRestoreSearchParameters(
        initialSearchParameterSelector(engine.state)
      );
      testExecuteSearch();
    });

    it(`when the fragment is unchanged
    should not execute a search`, () => {
      initUrlManager('q=test');
      manager.synchronize('q=test');

      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });

    it(`when a parameter's value changes
    should restore the right parameters and execute a search`, () => {
      initUrlManager('q=books');
      manager.synchronize('q=movies');

      testLatestRestoreSearchParameters({
        ...initialSearchParameterSelector(engine.state),
        q: 'movies',
      });
      testExecuteSearch();
    });

    it(`when a different parameters order changes
    should not execute a search`, () => {
      initUrlManager('q=books&sortCriteria=author ascending');
      manager.synchronize('sortCriteria=author ascending&q=books');

      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });

    it(`when repetitive parameters order changes
    should not execute a search`, () => {
      initUrlManager('f[author]=Cervantes&f[writer]=Kafka');
      manager.synchronize('f[writer]=Kafka&f[author]=Cervantes');

      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });

    it(`when a parameter's values order changes
    should not execute a search`, () => {
      initUrlManager('f[author]=Kafka,Cervantes');
      manager.synchronize('f[author]=Cervantes,Kafka');

      expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
    });
  });
});
