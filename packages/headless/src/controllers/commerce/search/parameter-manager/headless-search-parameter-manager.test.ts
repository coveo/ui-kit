import {queryReducer as commerceQuery} from '../../../../features/commerce/query/query-slice';
import {
  CommerceSearchParameters,
  restoreSearchParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {ParameterManager} from '../../core/parameter-manager/headless-core-parameter-manager';
import {buildSearchParameterManager} from './headless-search-parameter-manager';

jest.mock(
  '../../../../features/commerce/search-parameters/search-parameter-actions'
);
jest.mock('../../../../features/commerce/search/search-actions');

describe('search parameter manager', () => {
  let engine: MockedCommerceEngine;
  let searchParameterManager: ParameterManager<CommerceSearchParameters>;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initSearchParameterManager() {
    searchParameterManager = buildSearchParameterManager(engine, {
      initialState: {parameters: {}},
    });
  }

  beforeEach(() => {
    initEngine();
    initSearchParameterManager();
  });

  it('exposes #subscribe method', () => {
    expect(searchParameterManager.subscribe).toBeTruthy();
  });

  it('adds #commerceQuery reducer to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({commerceQuery});
  });

  it('dispatches #restoreSearchParameters on init', () => {
    const mockedRestoreSearchParametersAction = jest.mocked(
      restoreSearchParameters
    );
    expect(mockedRestoreSearchParametersAction).toHaveBeenLastCalledWith({});
  });

  describe('#synchronize', () => {
    it('dispatches #restoreSearchParameters', () => {
      const mockedRestoreSearchParametersAction = jest.mocked(
        restoreSearchParameters
      );
      const parameters = {
        q: 'some query',
      };
      searchParameterManager.synchronize(parameters);
      expect(mockedRestoreSearchParametersAction).toHaveBeenLastCalledWith({
        q: 'some query',
      });
    });

    it('dispatches #executeSearch', () => {
      const mockedExecuteSearchAction = jest.mocked(executeSearch);
      const parameters = {
        q: 'some query',
      };
      searchParameterManager.synchronize(parameters);
      expect(mockedExecuteSearchAction).toHaveBeenCalled();
    });
  });

  it('#state contains #parameters', () => {
    expect(searchParameterManager.state.parameters).toEqual({});
  });
});
