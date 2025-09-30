import type {Mock, MockInstance} from 'vitest';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import {
  buildProductListing,
  type ProductListing,
} from '../../../controllers/commerce/product-listing/headless-product-listing.js';
import {
  buildSearch,
  type Search,
} from '../../../controllers/commerce/search/headless-search.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockCommerceContext} from '../../../test/mock-context.js';
import {buildMockSSRCommerceEngine} from '../../../test/mock-engine-v2.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {defineMockCommerceController} from '../../../test/mock-ssr-controller-definitions.js';
import type {ContextOptions} from '../controllers/context/headless-context.ssr.js';
import {SolutionType} from '../types/controller-constants.js';
import type {BakedInControllers} from '../types/controller-definitions.js';
import type {InferControllersMapFromDefinition} from '../types/controller-inference.js';
import type {CommerceControllerDefinitionsMap} from '../types/engine.js';
import * as buildFactory from './build-factory.js';
import {fetchStaticStateFactory} from './static-state-factory.js';

vi.mock('../utils/controller-wiring.js');
vi.mock(
  '../../../controllers/commerce/product-listing/headless-product-listing.js'
);
vi.mock('../../../controllers/commerce/search/headless-search.js');

describe('fetchStaticStateFactory', () => {
  let mockNavigatorContext: NavigatorContext;
  let mockContext: ContextOptions;
  let engineSpy: MockInstance;
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
    mockContext = buildMockCommerceContext();
    mockNavigatorContext = buildMockNavigatorContext();
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
      <T extends SolutionType>(_: T) =>
        async () =>
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
      navigatorContext: mockNavigatorContext,
      context: mockContext,
    });
    expect(engineSpy.mock.calls[0][0]).toStrictEqual(definition);
  });

  it('should return the navigator context ', async () => {
    // @ts-expect-error: do not care about baked-in controller initial state
    const factory = fetchStaticStateFactory(definition, mockEngineOptions);
    await factory(SolutionType.listing)({
      navigatorContext: mockNavigatorContext,
      context: mockContext,
    });
  });

  describe('when solution type is listing', () => {
    beforeEach(async () => {
      // @ts-expect-error: do not care about baked-in controller initial state
      const factory = fetchStaticStateFactory(definition, mockEngineOptions);
      await factory(SolutionType.listing)({
        navigatorContext: mockNavigatorContext,
        context: mockContext,
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
        navigatorContext: mockNavigatorContext,
        context: {
          country: 'CA',
          currency: 'USD',
          language: 'en',
          view: {url: 'https://example.com'},
        },
        searchParams: {
          q: 'test',
        },
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
        navigatorContext: mockNavigatorContext,
        context: mockContext,
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
