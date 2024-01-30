import {queryReducer as commerceQuery} from '../../../../features/commerce/query/query-slice';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {UrlManager} from '../../../url-manager/headless-url-manager';
import {buildSearchUrlManager} from './headless-search-url-manager';

describe('search url manager', () => {
  let engine: MockCommerceEngine;
  let manager: UrlManager;

  function initUrlManager(fragment = '') {
    manager = buildSearchUrlManager(engine, {
      initialState: {
        fragment,
      },
    });
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine();
    initUrlManager();
  });

  describe('initialization', () => {
    it('adds the correct reducers to the engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({
        commerceSearch,
        commerceQuery,
      });
    });
  });

  describe('state', () => {
    it('contains the serialized fragment of the search parameters state', () => {
      engine.state.commerceQuery.query = 'books';
      expect(manager.state.fragment).toBe('q=books');
    });
  });
});
