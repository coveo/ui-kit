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

  function testLatestRestoreSearchParameters(newParams: SearchParameters = {}) {
    const action = restoreSearchParameters({
      ...initialSearchParameterSelector(engine.state),
      ...newParams,
    });
    expect(getLastestRestoreSearchParametersAction()).toEqual(action);
  }

  function testExecuteSearch() {
    expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
  }

  it('dispatches #restoreSearchParameters on registration', () => {
    expect(getLastestRestoreSearchParametersAction()).toBeTruthy();
  });

  it('does not execute a search on registration', () => {
    expect(engine.findAsyncAction(executeSearch.pending)).toBeFalsy();
  });

  it('initial #restoreSearchParameters should parse the fragment', () => {
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
    it(`when adding any parameter
    should restore the right parameters and execute a search`, () => {
      manager.synchronize('q=test');

      testLatestRestoreSearchParameters({q: 'test'});
      testExecuteSearch();
    });

    it(`when removing any parameter
    should restore the right parameters and execute a search`, () => {
      initUrlManager('q=test');

      manager.synchronize('');
      testLatestRestoreSearchParameters();
      testExecuteSearch();
    });
  });
});
