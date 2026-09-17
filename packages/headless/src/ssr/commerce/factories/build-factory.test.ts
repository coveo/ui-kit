import {describe, expect, it, type Mock, vi} from 'vitest';
import type {CommerceEngineOptions} from '../../../app/commerce-engine/commerce-engine.js';
import * as commerceEngine from '../../../app/commerce-engine/commerce-engine.js';
import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {buildLogger} from '../../../app/logger.js';
import {buildMockNavigatorContextProvider} from '../../../test/mock-navigator-context-provider.js';
import {defineCart} from '../controllers/cart/headless-cart.ssr.js';
import {defineProductList} from '../controllers/product-list/headless-product-list.ssr.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import {SolutionType} from '../types/controller-constants.js';
import {buildFactory} from './build-factory.js';

vi.mock('../../../app/logger.js');

describe('buildFactory', () => {
  const mockLogger = {
    warn: vi.fn(),
    debug: vi.fn(),
  };

  const mockEngineOptions: CommerceEngineOptions = {
    configuration: getSampleCommerceEngineConfiguration(),
    navigatorContextProvider: buildMockNavigatorContextProvider(),
  };

  const mockEmptyDefinition = {};

  beforeEach(() => {
    vi.spyOn(commerceEngine, 'buildCommerceEngine');
    (buildLogger as Mock).mockReturnValue(mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not warn if navigatorContextProvider is present', async () => {
    const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
    const build = factory(SolutionType.listing);

    await build();

    expect(mockLogger.warn).not.toHaveBeenCalled();
  });

  it('should warn if navigatorContextProvider is missing', async () => {
    const factory = buildFactory(mockEmptyDefinition, {
      configuration: getSampleCommerceEngineConfiguration(),
    });
    const build = factory(SolutionType.listing);

    await build();

    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Missing navigator context in server-side code')
    );
  });

  it('should throw an error for unsupported solution type', async () => {
    const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
    const build = factory('unsupported' as SolutionType);

    await expect(build()).rejects.toThrow('Unsupported solution type');
  });

  it('should register the engine for token updates with the engine as owner', async () => {
    const onAccessTokenUpdate = vi.fn();
    const factory = buildFactory(mockEmptyDefinition, {
      ...mockEngineOptions,
      onAccessTokenUpdate,
    });

    const {engine} = await factory(SolutionType.listing)();

    expect(onAccessTokenUpdate).toHaveBeenCalledExactlyOnceWith(expect.any(Function), engine);
  });

  describe('when building for standalone', () => {
    const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
    const build = factory(SolutionType.standalone);

    it('should build SSRCommerceEngine with standalone solution type', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.standalone);
      const result = await build();

      expect(result.engine).toBeDefined();
      expect(result.controllers).toBeDefined();
    });

    it('should never add middlewares', async () => {
      await build();
      expect(
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0].middlewares
      ).toHaveLength(0);
    });
  });

  describe('when building for search', () => {
    const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
    const build = factory(SolutionType.search);

    it('should build SSRCommerceEngine with search solution type', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.search);
      const result = await build();

      expect(result.engine).toBeDefined();
      expect(result.controllers).toBeDefined();
    });

    it('should always add a single middleware', async () => {
      await build();
      expect(
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0].middlewares
      ).toHaveLength(1);
    });
  });

  describe('when building for listing', () => {
    it('should build SSRCommerceEngine with listing solution type', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.listing);
      const result = await build();

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
        controllers: {cart: {initialState: {items: []}}},
      });

      const {controllers} = await factory(SolutionType.listing)({
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
        controllers: {cart: {initialState: {items: []}}},
      });

      const {controllers} = await factory(SolutionType.listing)({
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
      await factory(SolutionType.listing)();

      expect(
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0].middlewares
      ).toHaveLength(1);
    });
  });

  describe('when building for recommendations', () => {
    const controllerDefinition = {
      popularViewed: defineRecommendations({
        options: {
          slotId: 'slot_1',
        },
      }),
      popularBought: defineRecommendations({
        options: {
          slotId: 'slot_2',
        },
      }),
    };

    const factory = buildFactory(controllerDefinition, mockEngineOptions);
    const build = factory(SolutionType.recommendation);

    it('should build SSRCommerceEngine with recommendation solution type', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.recommendation);
      const result = await build();

      expect(result.engine).toBeDefined();
      expect(result.controllers).toBeDefined();
    });

    it('should not add middleware if not specified otherwise', async () => {
      await build({controllers: {}});
      expect(
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0].middlewares
      ).toHaveLength(0);
    });

    it('should add a middleware for each enabled recommendation', async () => {
      await build({
        controllers: {
          popularBought: {enabled: true},
          popularViewed: {enabled: true},
        },
      });
      expect(
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0].middlewares
      ).toHaveLength(2);
    });

    it('should not add middlewares if user disabled them', async () => {
      await build({
        controllers: {
          popularBought: {enabled: false},
          popularViewed: {enabled: false},
        },
      });
      expect(
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0].middlewares
      ).toHaveLength(0);
    });
  });

  describe('per-request access token', () => {
    it('should build the engine with the per-request access token when provided', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.listing);

      await build({accessToken: 'per-request-token'});

      expect(
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0].configuration.accessToken
      ).toBe('per-request-token');
    });

    it('should fall back to the definition access token when none is provided', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.listing);

      await build();

      expect(
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0].configuration.accessToken
      ).toBe(mockEngineOptions.configuration.accessToken);
    });

    it('should not mutate the shared definition configuration', async () => {
      // Use a fresh options object with a known token (not the shared fixture) so the assertion
      // genuinely verifies non-mutation: reusing the shared fixture could capture an already-leaked
      // value and pass even if the shared configuration were mutated.
      const definitionToken = 'definition-token';
      const freshOptions: CommerceEngineOptions = {
        configuration: {...getSampleCommerceEngineConfiguration(), accessToken: definitionToken},
        navigatorContextProvider: buildMockNavigatorContextProvider(),
      };
      const factory = buildFactory(mockEmptyDefinition, freshOptions);
      const build = factory(SolutionType.listing);

      await build({accessToken: 'per-request-token'});

      expect(freshOptions.configuration.accessToken).toBe(definitionToken);
    });

    it('should isolate the token across concurrent builds', async () => {
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.listing);

      await Promise.all([build({accessToken: 'token-A'}), build({accessToken: 'token-B'})]);

      const tokensUsed = (commerceEngine.buildCommerceEngine as Mock).mock.calls.map(
        (call) => call[0].configuration.accessToken
      );
      expect(tokensUsed).toContain('token-A');
      expect(tokensUsed).toContain('token-B');
    });

    it('should NOT subscribe a request-scoped per-request-token engine to shared token updates', async () => {
      const onAccessTokenUpdate = vi.fn();
      const factory = buildFactory(mockEmptyDefinition, {
        ...mockEngineOptions,
        onAccessTokenUpdate,
      });
      const build = factory(SolutionType.listing);

      await build({accessToken: 'per-request-token'});

      expect(onAccessTokenUpdate).not.toHaveBeenCalled();
    });

    it('should subscribe a per-request-token engine that outlives the request to shared token updates', async () => {
      const onAccessTokenUpdate = vi.fn();
      const factory = buildFactory(
        mockEmptyDefinition,
        {...mockEngineOptions, onAccessTokenUpdate},
        {engineOutlivesRequest: true}
      );
      const build = factory(SolutionType.listing);

      const {engine} = await build({accessToken: 'per-request-token'});

      expect(onAccessTokenUpdate).toHaveBeenCalledExactlyOnceWith(expect.any(Function), engine);
    });

    it('should still subscribe to shared token updates when no per-request token is provided', async () => {
      const onAccessTokenUpdate = vi.fn();
      const factory = buildFactory(mockEmptyDefinition, {
        ...mockEngineOptions,
        onAccessTokenUpdate,
      });
      const build = factory(SolutionType.listing);

      const {engine} = await build();

      expect(onAccessTokenUpdate).toHaveBeenCalledExactlyOnceWith(expect.any(Function), engine);
    });

    it('should let the deprecated extend hook override the per-request token', async () => {
      // The per-request token is applied before `extend` runs, so an extender that returns a
      // different access token wins — matching the documented "extend takes precedence".
      const factory = buildFactory(mockEmptyDefinition, mockEngineOptions);
      const build = factory(SolutionType.listing);

      await build({
        accessToken: 'per-request-token',
        extend: async (options) => ({
          ...options,
          configuration: {...options.configuration, accessToken: 'extend-token'},
        }),
      });

      expect(
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0].configuration.accessToken
      ).toBe('extend-token');
    });
  });
});
