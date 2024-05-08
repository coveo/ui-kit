import {stateKey} from '../../../../app/state-key';
import {
  CommerceSearchParameters,
  restoreSearchParameters,
} from '../../../../features/commerce/search-parameters/search-parameter-actions';
import {searchSerializer} from '../../../../features/commerce/search-parameters/search-parameter-serializer';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {buildSearchParameterManager} from '../../search/parameter-manager/headless-search-parameter-manager';
import {buildCoreUrlManager, UrlManager} from './headless-core-url-manager';

jest.mock(
  '../../../../features/commerce/search-parameters/search-parameter-actions'
);
jest.mock('../../../../features/commerce/search/search-actions');

describe('core url manager', () => {
  let engine: MockedCommerceEngine;
  let manager: UrlManager;
  let mockedExecuteSearchAction: jest.MockedFunctionDeep<typeof executeSearch>;
  let mockedRestoreSearchParametersAction: jest.MockedFunctionDeep<
    typeof restoreSearchParameters
  >;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

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
    jest.clearAllMocks();
    mockedExecuteSearchAction = jest.mocked(executeSearch);
    mockedRestoreSearchParametersAction = jest.mocked(restoreSearchParameters);
    initEngine();
    initUrlManager();
  });

  function testLatestRestoreSearchParameters(params: CommerceSearchParameters) {
    expect(mockedRestoreSearchParametersAction).toHaveBeenLastCalledWith(
      params
    );
  }

  function testExecuteSearch() {
    expect(mockedExecuteSearchAction).toHaveBeenCalled();
  }

  describe('initialization', () => {
    it('initializes', () => {
      expect(manager).toBeTruthy();
    });

    it('dispatches #restoreSearchParameters', () => {
      expect(mockedRestoreSearchParametersAction).toHaveBeenCalled();
    });

    it('does not execute a search', () => {
      expect(mockedExecuteSearchAction).not.toHaveBeenCalled();
    });

    it('initial #restoreActionCreator should parse the "active" fragment', () => {
      initUrlManager('q=windmill');
      testLatestRestoreSearchParameters({
        q: 'windmill',
      });
    });
  });

  describe('#state', () => {
    it('contains the serialized fragment of the search parameters state', () => {
      engine[stateKey].commerceQuery.query = 'books';
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
      engine[stateKey].commerceQuery.query = 'test';
      manager.synchronize('');

      testLatestRestoreSearchParameters({});
      testExecuteSearch();
    });

    it(`when the fragment is unchanged
    should not execute a search`, () => {
      engine[stateKey].commerceQuery.query = 'test';
      manager.synchronize('q=test');

      expect(mockedExecuteSearchAction).not.toHaveBeenCalled();
    });

    it(`when a parameter's value changes
    should restore the right parameters and execute a search`, () => {
      engine[stateKey].commerceQuery.query = 'books';
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

        engine[stateKey].commerceSearch.requestId = 'abcde';
        callListener();

        expect(listener).not.toHaveBeenCalled();
      });

      it('when only a fragment value is modified', () => {
        const listener = jest.fn();
        manager.subscribe(listener);

        engine[stateKey].commerceQuery.query = 'albums';
        callListener();

        expect(listener).not.toHaveBeenCalled();
      });
    });

    describe('should call listener', () => {
      it('when a fragment value is added and the requestId has changed', () => {
        const listener = jest.fn();
        manager.subscribe(listener);

        engine[stateKey].commerceSearch.requestId = 'abcde';
        engine[stateKey].commerceQuery.query = 'books';
        callListener();

        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('when a fragment value is removed and the requestId has changed', () => {
        initUrlManager('q=movies');

        const listener = jest.fn();
        manager.subscribe(listener);

        engine[stateKey].commerceSearch.requestId = 'abcde';
        engine[stateKey].commerceQuery.query = '';
        callListener();

        expect(listener).toHaveBeenCalledTimes(1);
      });
    });
  });
});
