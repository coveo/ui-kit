import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {describe, expect, it, type Mock, type MockInstance, vi} from 'vitest';
import {buildCommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildLogger} from '../../../app/logger.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockCommerceEngine} from '../../../test/mock-engine-v2.js';
import {buildMockNavigatorContextProvider} from '../../../test/mock-navigator-context-provider.js';
import {
  defineMockCommerceController,
  defineMockRecommendationDefinition,
} from '../../../test/mock-ssr-controller-definitions.js';
import {defineCart} from '../controllers/cart/headless-cart.ssr.js';
import {defineProductList} from '../controllers/product-list/headless-product-list.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import type {
  CommonBuildConfig,
  ListingBuildConfig,
  SearchBuildConfig,
  SSRCommerceEngineOptions,
  StandaloneBuildConfig,
} from '../types/build.js';
import {SolutionType} from '../types/controller-constants.js';
import {wireControllerParams} from '../utils/controller-wiring.js';
import {buildFactory} from './build-factory.js';

vi.mock('../utils/controller-wiring.js');
vi.mock('../../../app/logger.js');
vi.mock('../../../app/commerce-engine/commerce-engine.js');

describe('buildFactory', () => {
  const mockWireControllerParams = vi.mocked(wireControllerParams);
  const mockBuildCommerceEngine = vi.mocked(buildCommerceEngine);
  const mockBuildOptions = {
    context: {
      country: 'US',
      currency: 'USD' as CurrencyCodeISO4217,
      recommendations: [],
      language: 'en-US',
      view: {url: 'http://example.com'},
    },
    searchParams: {
      query: 'query',
    },
  };

  const mockLogger = {
    warn: vi.fn(),
    debug: vi.fn(),
  };

  let mockDispatch: MockInstance;
  const mockEngineOptions: SSRCommerceEngineOptions = {
    configuration: getSampleCommerceEngineConfiguration(),
    navigatorContextProvider: buildMockNavigatorContextProvider(),
  };

  const mockEmptyDefinition = {};

  beforeEach(() => {
    mockDispatch = vi.fn();
    vi.resetAllMocks();

    mockBuildCommerceEngine.mockReturnValue({
      ...buildMockCommerceEngine(buildMockCommerceState()),
      //@ts-expect-error: type is irrelevant here
      dispatch: mockDispatch,
    });
    (buildLogger as Mock).mockReturnValue(mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call #wireControllerParams with the correct params', async () => {
    const definition = {
      controller1: defineMockCommerceController(),
      controller2: defineMockCommerceController(),
    };

    const factory = buildFactory(definition, mockEngineOptions);
    await factory(SolutionType.listing)({
      context: {
        country: 'CA',
        currency: 'USD',
        language: 'en',
        view: {url: 'https://example.com'},
      },
    });

    expect(mockWireControllerParams.mock.calls[0][0]).toStrictEqual('listing');
    expect(mockWireControllerParams.mock.calls[0][1]).toStrictEqual(
      expect.objectContaining({
        controller1: expect.any(Object),
        controller2: expect.any(Object),
      })
    );
    expect(mockWireControllerParams.mock.calls[0][2]).toStrictEqual({
      context: {
        country: 'CA',
        currency: 'USD',
        language: 'en',
        view: {url: 'https://example.com'},
      },
    });
  });

  it('should dispatch search actions and wait for request completion', async () => {
    const definition = {
      controller1: defineMockCommerceController(),
      controller2: defineMockCommerceController(),
    };

    mockWireControllerParams.mockReturnValueOnce({
      searchActions: ['search-action'],
    });

    const factory = buildFactory(definition, mockEngineOptions);

    await factory(SolutionType.listing)({
      context: {
        country: 'CA',
        currency: 'USD',
        language: 'en',
        view: {url: 'https://example.com'},
      },
      searchActions: [{type: 'search-action'}],
    });

    expect(mockDispatch).toHaveBeenCalledWith({type: 'search-action'});
  });

  it('should not warn if navigatorContextProvider is present', async () => {
    const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
    const build = factory(SolutionType.listing);

    await build(mockBuildOptions as ListingBuildConfig);

    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should warn if navigatorContextProvider is missing', async () => {
    const factory = buildFactory(mockEmptyDefinition, {
      configuration: getSampleCommerceEngineConfiguration(),
    });
    const build = factory(SolutionType.listing);

    await build(mockBuildOptions as ListingBuildConfig);

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing navigator context in server-side code')
    );
  });

  it('should throw an error for unsupported solution type', async () => {
    const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
    const build = factory('unsupported' as SolutionType);

    await expect(build(mockBuildOptions as CommonBuildConfig)).rejects.toThrow(
      'Unsupported solution type'
    );
  });

  describe('when building for standalone', () => {
    const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
    const build = factory(SolutionType.standalone);

    it('should build SSRCommerceEngine with standalone solution type', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.standalone);
      const result = await build(mockBuildOptions as StandaloneBuildConfig);

      expect(result.engine).toBeDefined();
      expect(result.controllers).toBeDefined();
    });

    it('should never add middlewares', async () => {
      await build(mockBuildOptions as StandaloneBuildConfig);
      expect(mockBuildCommerceEngine.mock.calls[0][0].middlewares).toHaveLength(
        0
      );
    });
  });

  describe('when building for search', () => {
    const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
    const build = factory(SolutionType.search);

    it('should build SSRCommerceEngine with search solution type', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.search);
      const result = await build(mockBuildOptions as SearchBuildConfig);

      expect(result.engine).toBeDefined();
      expect(result.controllers).toBeDefined();
    });

    it('should always add a single middleware', async () => {
      await build(mockBuildOptions as SearchBuildConfig);
      expect(mockBuildCommerceEngine.mock.calls[0][0].middlewares).toHaveLength(
        1
      );
    });
  });

  describe('when building for listing', () => {
    it('should build SSRCommerceEngine with listing solution type', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.listing);
      const result = await build(mockBuildOptions as ListingBuildConfig);

      expect(result.engine).toBeDefined();
      expect(result.controllers).toBeDefined();
    });

    it('should return static state from build result with product and searchbox controllers', async () => {
      const factory = buildFactory(
        {
          products: defineProductList(),
          searchBox: defineSearchBox(),
          cart: defineCart(),
        },
        mockEngineOptions
      );
      await factory(SolutionType.listing)({
        ...(mockBuildOptions as ListingBuildConfig),
        controllers: {cart: {initialState: {items: []}}},
      });

      const {controllers} = await factory(SolutionType.listing)({
        ...(mockBuildOptions as ListingBuildConfig),
        controllers: {cart: {initialState: {items: []}}},
      });

      expect(Object.keys(controllers)).toHaveLength(2);
      expect(controllers.cart).not.toBeUndefined();
      expect(controllers.products).not.toBeUndefined();
      // @ts-expect-error SearchBox is not a listing controller
      expect(controllers.searchBox).toBeUndefined();
    });

    it('should return static state from build result without the listing controller', async () => {
      const factory = buildFactory(
        {
          products: defineProductList({listing: false}),
          searchBox: defineSearchBox(),
          cart: defineCart(),
        },
        mockEngineOptions
      );
      await factory(SolutionType.listing)({
        ...(mockBuildOptions as ListingBuildConfig),
        controllers: {cart: {initialState: {items: []}}},
      });

      const {controllers} = await factory(SolutionType.listing)({
        ...(mockBuildOptions as ListingBuildConfig),
        controllers: {cart: {initialState: {items: []}}},
      });

      expect(Object.keys(controllers)).toHaveLength(1);
      expect(controllers.cart).not.toBeUndefined();
      // @ts-expect-error Products is disabled for listing
      expect(controllers.products).toBeUndefined();
      // @ts-expect-error SearchBox is not a listing controller
      expect(controllers.searchBox).toBeUndefined();
    });

    it('should always add a single middleware', async () => {
      const factory = buildFactory(
        {
          products: defineProductList(),
          searchBox: defineSearchBox(),
        },
        mockEngineOptions
      );
      await factory(SolutionType.listing)(
        mockBuildOptions as ListingBuildConfig
      );

      expect(mockBuildCommerceEngine.mock.calls[0][0].middlewares).toHaveLength(
        1
      );
    });
  });

  describe('when building for recommendations', () => {
    const controllerDefinition = {
      rec1: defineMockRecommendationDefinition('slot_1'),
      rec2: defineMockRecommendationDefinition('slot_2'),
    };

    const factory = buildFactory(controllerDefinition, mockEngineOptions);
    const build = factory(SolutionType.recommendation);

    beforeEach(() => {
      const mockWiredRecommendations = {
        rec1: {
          state: {},
          initialState: {},
        },
        rec2: {
          state: {},
          initialState: {},
        },
      };
      mockWireControllerParams.mockReturnValueOnce(mockWiredRecommendations);
    });

    it('should build an SSRCommerceEngine with recommendation solution type', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.recommendation);
      const result = await build(mockBuildOptions);

      expect(result.engine).toBeDefined();
      expect(result.controllers).toBeDefined();
    });

    it('should add no middleware if no recommendation was specified in the build props', async () => {
      await build({
        ...mockBuildOptions,
        recommendations: [],
      });
      expect(mockBuildCommerceEngine.mock.calls[0][0].middlewares).toHaveLength(
        0
      );
    });

    it('should add a middleware for each recommendation in the build props', async () => {
      await build({
        ...mockBuildOptions,
        recommendations: ['rec1', 'rec2'],
      });
      expect(mockBuildCommerceEngine.mock.calls[0][0].middlewares).toHaveLength(
        2
      );
    });
  });
});
