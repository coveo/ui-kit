import {stateKey} from '../../../../app/state-key';
import {queryReducer as commerceQuery} from '../../../../features/commerce/query/query-slice';
import {restoreSearchParameters} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {UrlManager} from '../../../url-manager/headless-url-manager';
import {buildSearchUrlManager} from './headless-search-url-manager';

jest.mock(
  '../../../../features/commerce/search-parameters/search-parameter-actions'
);
jest.mock('../../../../features/commerce/search/search-actions');

describe('search url manager', () => {
  let engine: MockedCommerceEngine;
  let manager: UrlManager;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initUrlManager(fragment = '') {
    manager = buildSearchUrlManager(engine, {
      initialState: {
        fragment,
      },
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    initEngine();
    initUrlManager();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(manager).toBeTruthy();
    });

    it('adds the correct reducers to the engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({
        commerceSearch,
        commerceQuery,
      });
    });

    it('dispatches #restoreProductListingParameters', () => {
      const mockedRestoreSearchParametersAction = jest.mocked(
        restoreSearchParameters
      );
      expect(mockedRestoreSearchParametersAction).toHaveBeenCalled();
    });

    it('does not execute a search', () => {
      const mockedExecuteSearchAction = jest.mocked(executeSearch);
      expect(mockedExecuteSearchAction).not.toHaveBeenCalled();
    });

    it('initial #restoreActionCreator should parse the "active" fragment', () => {
      initUrlManager('q=some%20query');
      const mockedRestoreProductListingParametersAction = jest.mocked(
        restoreSearchParameters
      );
      expect(
        mockedRestoreProductListingParametersAction
      ).toHaveBeenLastCalledWith({
        q: 'some query',
      });
    });
  });

  describe('#state', () => {
    it('contains the serialized fragment of the search parameters state', () => {
      engine[stateKey].commerceQuery.query = 'books';
      expect(manager.state.fragment).toBe('q=books');
    });
  });
});
