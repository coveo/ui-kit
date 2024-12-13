import {Mock, describe, it, expect, vi} from 'vitest';
import {defineCart} from '../../../controllers/commerce/context/cart/headless-cart.ssr.js';
import {defineProductList} from '../../../controllers/commerce/product-list/headless-product-list.ssr.js';
import {defineRecommendations} from '../../../controllers/commerce/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../../../controllers/commerce/search-box/headless-search-box.ssr.js';
import {getSampleCommerceEngineConfiguration} from '../../commerce-engine/commerce-engine-configuration.js';
import * as commerceEngine from '../../commerce-engine/commerce-engine.js';
import {CommerceEngineOptions} from '../../commerce-engine/commerce-engine.js';
import {buildLogger} from '../../logger.js';
import {SolutionType} from '../types/common.js';
import {buildFactory} from './build-factory.js';

vi.mock('../../logger.js');

describe('buildFactory', () => {
  const mockLogger = {
    warn: vi.fn(),
    debug: vi.fn(),
  };

  const mockEngineOptions: CommerceEngineOptions = {
    configuration: getSampleCommerceEngineConfiguration(),
    navigatorContextProvider: vi.fn(),
  };

  const mockEmptyDefinition = {};

  beforeEach(() => {
    vi.spyOn(commerceEngine, 'buildCommerceEngine');
    (buildLogger as Mock).mockReturnValue(mockLogger);
  });

  afterEach(() => {
    vi.clearAllMocks();
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
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0]
          .middlewares
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
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0]
          .middlewares
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

    it('should return static state from build result with listing controllers only', async () => {
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

    it('should return static state from build result with listing controllers only', async () => {
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
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0]
          .middlewares
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
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0]
          .middlewares
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
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0]
          .middlewares
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
        (commerceEngine.buildCommerceEngine as Mock).mock.calls[0][0]
          .middlewares
      ).toHaveLength(0);
    });
  });
});
