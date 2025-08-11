import type {Mock, MockInstance} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import type {LoggerOptions} from '../../../app/logger.js';
import {
  buildProductListing,
  type ProductListing,
} from '../../../controllers/commerce/product-listing/headless-product-listing.js';
import {
  buildSearch,
  type Search,
} from '../../../controllers/commerce/search/headless-search.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {defineMockCommerceController} from '../../../test/mock-controller-definitions.js';
import {buildMockSSRCommerceEngine} from '../../../test/mock-engine-v2.js';
import * as augmentModule from '../../common/augment-preprocess-request.js';
import {SolutionType} from '../types/controller-constants.js';
import type {InferControllersMapFromDefinition} from '../types/controller-inference.js';
import type {
  BakedInControllers,
  CommerceControllerDefinitionsMap,
} from '../types/engine.js';
import {wireControllerParams} from '../utils/state-wiring.js';
import * as buildFactory from './build-factory.js';
import {fetchStaticStateFactory} from './static-state-factory.js';

vi.mock('../utils/state-wiring.js');
vi.mock(
  '../../../controllers/commerce/product-listing/headless-product-listing.js'
);
vi.mock('../../../controllers/commerce/search/headless-search.js');

describe('fetchStaticStateFactory', () => {
  let engineSpy: MockInstance;
  const mockWireControllerParams = vi.mocked(wireControllerParams);
  const mockBuildProductListing = vi.mocked(buildProductListing);
  const mockBuildSearch = vi.mocked(buildSearch);
  const mockExecuteFirstRequest = vi.fn();
  const mockedExecuteFirstSearch = vi.fn();
  const mockEngine = buildMockSSRCommerceEngine(buildMockCommerceState());
  const mockEngineOptions = {
    configuration: getSampleCommerceEngineConfiguration(),
  };

  const definition = {
    controller1: defineMockCommerceController(),
    controller2: defineMockCommerceController(),
  };

  beforeEach(() => {
    mockBuildProductListing.mockImplementation(
      () =>
        ({
          executeFirstRequest: mockExecuteFirstRequest,
        }) as unknown as ProductListing
    );

    mockBuildSearch.mockImplementation(
      () =>
        ({
          executeFirstSearch: mockedExecuteFirstSearch,
        }) as unknown as Search
    );

    engineSpy = vi.spyOn(buildFactory, 'buildFactory').mockReturnValue(
      () =>
        <T extends SolutionType>() =>
          Promise.resolve({
            engine: mockEngine,
            controllers: {} as InferControllersMapFromDefinition<
              CommerceControllerDefinitionsMap,
              T
            > &
              BakedInControllers,
          })
    );

    mockExecuteFirstRequest.mockReturnValue(Promise.resolve());
    mockedExecuteFirstSearch.mockReturnValue(Promise.resolve());
    (mockEngine.waitForRequestCompletedAction as Mock).mockReturnValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call buildFactory with the correct parameters', async () => {
    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStaticStateFactory(definition, mockEngineOptions);
    await factory(SolutionType.listing)({
      country: 'CA',
      currency: 'USD',
      language: 'en',
      url: 'https://example.com',
    });
    expect(engineSpy.mock.calls[0][0]).toStrictEqual(definition);
  });

  it('should call #wireControllerParams with the correct params', async () => {
    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStaticStateFactory(definition, mockEngineOptions);
    await factory(SolutionType.listing)({
      country: 'CA',
      currency: 'USD',
      language: 'en',
      url: 'https://example.com',
    });

    expect(mockWireControllerParams.mock.calls[0][0]).toStrictEqual('listing');
    expect(mockWireControllerParams.mock.calls[0][1]).toStrictEqual(
      expect.objectContaining({
        controller1: expect.any(Object),
        controller2: expect.any(Object),
      })
    );
    expect(mockWireControllerParams.mock.calls[0][2]).toStrictEqual([
      {
        country: 'CA',
        currency: 'USD',
        language: 'en',
        url: 'https://example.com',
      },
    ]);
  });

  it('should call augmentPreprocessRequestWithForwardedFor when fetchStaticState is invoked', async () => {
    const spy = vi.spyOn(
      augmentModule,
      'augmentPreprocessRequestWithForwardedFor'
    );

    const mockNavigatorContextProvider = vi.fn();
    const mockPreprocessRequest = vi.fn(async (req) => req);
    const options = {
      configuration: {
        ...getSampleCommerceEngineConfiguration(),
        preprocessRequest: mockPreprocessRequest,
      },
      navigatorContextProvider: mockNavigatorContextProvider,
      loggerOptions: {level: 'warn'} as LoggerOptions,
    };

    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStaticStateFactory(definition, options);
    await factory(SolutionType.listing)({
      country: 'CA',
      currency: 'USD',
      language: 'en',
      url: 'https://example.com',
    });
    expect(spy).toHaveBeenCalledWith({
      loggerOptions: {level: 'warn'},
      navigatorContextProvider: mockNavigatorContextProvider,
      preprocessRequest: mockPreprocessRequest,
    });

    spy.mockRestore();
  });

  describe('when solution type is listing', () => {
    beforeEach(async () => {
      // @ts-expect-error: do not care about baked-in controller initial state
      const factory = fetchStaticStateFactory(definition, mockEngineOptions);
      await factory(SolutionType.listing)({
        country: 'CA',
        currency: 'USD',
        language: 'en',
        url: 'https://example.com',
      });
    });

    it('should build a product listing controller', async () => {
      expect(buildProductListing).toHaveBeenCalledTimes(1);
    });

    it('should perform a listing request ', async () => {
      expect(mockExecuteFirstRequest).toHaveBeenCalledTimes(1);
    });

    it('should not perform a search request ', async () => {
      expect(mockedExecuteFirstSearch).toHaveBeenCalledTimes(0);
    });
  });

  describe('when solution type is search', () => {
    beforeEach(async () => {
      // @ts-expect-error: do not care about baked-in controller initial state
      const factory = fetchStaticStateFactory(definition, mockEngineOptions);
      await factory(SolutionType.search)({
        country: 'CA',
        currency: 'USD',
        language: 'en',
        query: 'test',
        url: 'https://example.com',
      });
    });

    it('should build a search controller', async () => {
      expect(buildSearch).toHaveBeenCalledTimes(1);
    });

    it('should perform a search request ', async () => {
      expect(mockedExecuteFirstSearch).toHaveBeenCalledTimes(1);
    });

    it('should not perform a listing request ', async () => {
      expect(mockExecuteFirstRequest).toHaveBeenCalledTimes(0);
    });
  });

  describe('when solution type is standalone', () => {
    beforeEach(async () => {
      // @ts-expect-error: do not care about baked-in controller initial state
      const factory = fetchStaticStateFactory(definition, mockEngineOptions);
      await factory(SolutionType.standalone)({
        country: 'CA',
        currency: 'USD',
        language: 'en',
        url: 'https://example.com',
      });
    });

    it('should not build search or listing controllers', async () => {
      expect(buildSearch).toHaveBeenCalledTimes(0);
      expect(buildProductListing).toHaveBeenCalledTimes(0);
    });

    it('should not perform any request ', async () => {
      expect(mockedExecuteFirstSearch).toHaveBeenCalledTimes(0);
      expect(mockExecuteFirstRequest).toHaveBeenCalledTimes(0);
    });
  });
});
