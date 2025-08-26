import type {Mock} from 'vitest';
import {configuration} from '../../app/common-reducers.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {restoreSearchParameters} from '../../features/search-parameters/search-parameter-actions.js';
import {initialSearchParameterSelector} from '../../features/search-parameters/search-parameter-selectors.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {buildUrlManager, type UrlManager} from './headless-url-manager.js';

vi.mock('../../features/search-parameters/search-parameter-actions');
vi.mock('../../features/search/search-actions');

describe('url manager', () => {
  let engine: MockedSearchEngine;
  let manager: UrlManager;

  function initUrlManager(fragment = '') {
    manager = buildUrlManager(engine, {
      initialState: {
        fragment,
      },
    });
  }

  beforeEach(() => {
    vi.resetAllMocks();
    engine = buildMockSearchEngine(createMockState());
    initUrlManager();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({configuration});
  });

  it('dispatches #restoreSearchParameters on registration', () => {
    expect(restoreSearchParameters).toHaveBeenCalled();
  });

  it('does not execute a search on registration', () => {
    expect(executeSearch).not.toHaveBeenCalled();
  });

  it('initial #restoreSearchParameters should parse the "active" fragment', () => {
    initUrlManager('q=windmill&f-author=Cervantes');
    expect(restoreSearchParameters).toHaveBeenCalledWith({
      q: 'windmill',
      f: {author: ['Cervantes']},
    });
  });

  it('returns the serialized fragment of the search parameters state', () => {
    engine.state.query!.q = 'books';
    engine.state.sortCriteria = 'author ascending';
    expect(manager.state.fragment).toBe(
      `q=books&sortCriteria=author${encodeURIComponent(' ')}ascending`
    );
  });

  describe('synchronize with parameter', () => {
    it(`when adding a parameter
    should restore the right parameters and execute a search`, () => {
      manager.synchronize('q=test');

      const initialParameters = initialSearchParameterSelector(engine.state);

      expect(restoreSearchParameters).toHaveBeenCalledWith({
        ...initialParameters,
        q: 'test',
      });
      expect(executeSearch).toHaveBeenCalled();
    });

    it(`when removing a parameter
    should restore the right parameters and execute a search`, () => {
      engine.state.query!.q = 'test';
      manager.synchronize('');

      const {tab: _tab, ...initialParametersWithoutTab} =
        initialSearchParameterSelector(engine.state);

      expect(restoreSearchParameters).toHaveBeenCalledWith(
        expect.objectContaining(initialParametersWithoutTab)
      );
      expect(executeSearch).toHaveBeenCalled();
    });

    it(`when the fragment is unchanged
    should not execute a search`, () => {
      engine.state.query!.q = 'test';
      manager.synchronize('q=test');

      expect(executeSearch).not.toHaveBeenCalled();
    });

    it(`when a parameter's value changes
    should restore the right parameters and execute a search`, () => {
      engine.state.query!.q = 'books';
      manager.synchronize('q=movies');

      const initialParameters = initialSearchParameterSelector(engine.state);

      expect(restoreSearchParameters).toHaveBeenCalledWith({
        ...initialParameters,
        q: 'movies',
      });

      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#subscribe', () => {
    function callListener() {
      return (engine.subscribe as Mock).mock.calls.map((args) => args[0])[0]();
    }

    it('should not call listener when initially subscribing', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      expect(listener).not.toHaveBeenCalled();
    });

    it('should not call listener when only the requestId changes', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      engine.state.search.requestId = 'abcde';
      callListener();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should not call listener when only a fragment value modified', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      engine.state.query!.q = 'albums';
      callListener();

      expect(listener).not.toHaveBeenCalled();
    });

    it('should call listener when a fragment value is added and the requestId has changed', () => {
      const listener = vi.fn();
      manager.subscribe(listener);

      engine.state.search.requestId = 'abcde';
      engine.state.query!.q = 'books';
      callListener();

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should call listener when a fragment value is removed and the requestId has changed', () => {
      initUrlManager('q=movies');

      const listener = vi.fn();
      manager.subscribe(listener);

      engine.state.search.requestId = 'abcde';
      engine.state.query!.q = '';
      callListener();

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
