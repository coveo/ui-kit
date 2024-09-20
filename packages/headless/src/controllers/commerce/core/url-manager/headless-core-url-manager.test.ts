import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  MockedCommerceEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildCoreUrlManager, UrlManager} from './headless-core-url-manager.js';

describe('core url manager', () => {
  let engine: MockedCommerceEngine;
  let manager: UrlManager;
  const mockRequestIdSelector = jest.fn();
  const mockExecuteSearchAction = jest.fn();
  const mockParameterManagerBuilder = jest.fn();
  const mockSerializer = {
    serialize: jest.fn(),
    deserialize: jest.fn(),
  };

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initUrlManager(fragment = '') {
    manager = buildCoreUrlManager(engine, {
      initialState: {
        fragment,
      },
      requestIdSelector: mockRequestIdSelector,
      parameterManagerBuilder: mockParameterManagerBuilder,
      serializer: mockSerializer,
    });
  }

  beforeEach(() => {
    jest.resetAllMocks();
    initEngine();
    initUrlManager();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(manager).toBeTruthy();
    });

    it('builds #parameterManagerBuilder', () => {
      const parameters = {
        page: 1,
        perPage: 2,
      };
      mockSerializer.deserialize.mockReturnValue(parameters);

      initUrlManager('page=1&perPage=2');

      expect(mockParameterManagerBuilder).toHaveBeenCalledWith(
        engine,
        expect.objectContaining({
          initialState: {
            parameters,
          },
        })
      );
    });

    it('does not execute a search', () => {
      expect(mockExecuteSearchAction).not.toHaveBeenCalled();
    });
  });

  describe('#state', () => {
    it('contains the serialized fragment of the parameters state', () => {
      mockParameterManagerBuilder.mockReturnValue({
        state: {},
      });

      initUrlManager();

      mockSerializer.serialize.mockReturnValue('page=2');
      expect(manager.state.fragment).toBe('page=2');
    });
  });

  it('#synchronize calls #synchronize on parameter manager', () => {
    mockSerializer.deserialize.mockReturnValue({page: 0});
    const mockSynchronize = jest.fn();
    mockParameterManagerBuilder.mockReturnValue({
      synchronize: mockSynchronize,
    });

    initUrlManager();
    manager.synchronize('page=0');

    expect(mockSynchronize).toHaveBeenCalledWith({page: 0});
  });

  describe('#subscribe', () => {
    function callListener() {
      return (engine.subscribe as jest.Mock).mock.calls.map(
        (args) => args[0]
      )[0]();
    }

    beforeEach(() => {
      mockParameterManagerBuilder.mockReturnValue({
        state: {},
      });
      initUrlManager();
    });

    describe('should not call listener', () => {
      it('when initially subscribing', () => {
        const listener = jest.fn();
        manager.subscribe(listener);

        expect(listener).not.toHaveBeenCalled();
      });

      it('when only the requestId changes', () => {
        const listener = jest.fn();
        manager.subscribe(listener);

        mockRequestIdSelector.mockReturnValue('abcde');
        callListener();

        expect(listener).not.toHaveBeenCalled();
      });

      it('when only a fragment value is modified', () => {
        const listener = jest.fn();
        manager.subscribe(listener);

        mockSerializer.serialize.mockReturnValue('q=albums');
        callListener();

        expect(listener).not.toHaveBeenCalled();
      });
    });

    describe('should call listener', () => {
      it('when a fragment value is added and the requestId has changed', () => {
        mockRequestIdSelector.mockReturnValueOnce('new-request-id');
        mockSerializer.serialize.mockReturnValueOnce('q=new-fragment');
        mockSerializer.deserialize.mockImplementation((fragment) => fragment);

        const listener = jest.fn();
        initUrlManager('q=old-fragment');
        manager.subscribe(listener);

        callListener();

        expect(listener).toHaveBeenCalledTimes(1);
      });

      it('when a fragment value is removed and the requestId has changed', () => {
        mockRequestIdSelector.mockReturnValueOnce('new-request-id');
        mockSerializer.serialize.mockReturnValue('');
        mockSerializer.deserialize.mockImplementation((fragment) => fragment);

        initUrlManager('q=fragment-to-remove');

        const listener = jest.fn();
        manager.subscribe(listener);

        callListener();

        expect(listener).toHaveBeenCalledTimes(1);
      });
    });
  });
});
