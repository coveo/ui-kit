import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as ProductEnrichmentActions from '../../../features/commerce/product-enrichment/product-enrichment-actions.js';
import {productEnrichmentReducer} from '../../../features/commerce/product-enrichment/product-enrichment-slice.js';
import {getProductEnrichmentInitialState} from '../../../features/commerce/product-enrichment/product-enrichment-state.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockBadgesProduct} from '../../../test/mock-product-enrichment.js';
import {
  buildProductEnrichment,
  type ProductEnrichment,
  type ProductEnrichmentProps,
} from './headless-product-enrichment.js';

vi.mock(
  '../../../features/commerce/product-enrichment/product-enrichment-actions'
);

describe('ProductEnrichment', () => {
  let engine: MockedCommerceEngine;
  let controller: ProductEnrichment;

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('adds the productEnrichment reducer to engine', () => {
      buildProductEnrichment(engine);
      expect(engine.addReducers).toHaveBeenCalledWith({
        productEnrichment: productEnrichmentReducer,
      });
    });

    it('initializes with default options when no props provided', () => {
      controller = buildProductEnrichment(engine);
      expect(controller).toBeDefined();
    });

    it('accepts custom placementIds in options', () => {
      const props: ProductEnrichmentProps = {
        options: {
          placementIds: ['placement1', 'placement2'],
        },
      };
      controller = buildProductEnrichment(engine, props);
      expect(controller).toBeDefined();
    });

    it('accepts custom productId in options', () => {
      const props: ProductEnrichmentProps = {
        options: {
          placementIds: ['placement1'],
          productId: 'product123',
        },
      };
      controller = buildProductEnrichment(engine, props);
      expect(controller).toBeDefined();
    });

    it('throws error when initialized with empty placementIds', () => {
      expect(() => {
        buildProductEnrichment(engine, {
          options: {
            placementIds: [],
          },
        });
      }).toThrow();
    });
  });

  describe('#state', () => {
    it('returns the productEnrichment state from the engine', () => {
      controller = buildProductEnrichment(engine);
      expect(controller.state).toEqual(getProductEnrichmentInitialState());
    });

    it('returns products from state', () => {
      const mockProduct = buildMockBadgesProduct({productId: 'test-product'});
      const state = buildMockCommerceState({
        productEnrichment: {
          products: [mockProduct],
          isLoading: false,
          error: null,
        },
      });
      engine = buildMockCommerceEngine(state);
      controller = buildProductEnrichment(engine);

      expect(controller.state.products).toEqual([mockProduct]);
      expect(controller.state.products[0].productId).toBe('test-product');
    });

    it('returns loading state', () => {
      const state = buildMockCommerceState({
        productEnrichment: {
          products: [],
          isLoading: true,
          error: null,
        },
      });
      engine = buildMockCommerceEngine(state);
      controller = buildProductEnrichment(engine);

      expect(controller.state.isLoading).toBe(true);
    });

    it('returns error state', () => {
      const mockError = {
        statusCode: 500,
        message: 'Internal Server Error',
        type: 'error',
      };
      const state = buildMockCommerceState({
        productEnrichment: {
          products: [],
          isLoading: false,
          error: mockError,
        },
      });
      engine = buildMockCommerceEngine(state);
      controller = buildProductEnrichment(engine);

      expect(controller.state.error).toEqual(mockError);
    });
  });

  describe('#getBadges', () => {
    it('dispatches fetchBadges with configured placementIds', () => {
      const fetchBadges = vi.spyOn(ProductEnrichmentActions, 'fetchBadges');
      const props: ProductEnrichmentProps = {
        options: {
          placementIds: ['placement1', 'placement2'],
        },
      };

      controller = buildProductEnrichment(engine, props);
      controller.getBadges();

      expect(fetchBadges).toHaveBeenCalledWith({
        placementIds: ['placement1', 'placement2'],
        productId: undefined,
      });
    });

    it('dispatches fetchBadges with configured placementIds and productId', () => {
      const fetchBadges = vi.spyOn(ProductEnrichmentActions, 'fetchBadges');
      const props: ProductEnrichmentProps = {
        options: {
          placementIds: ['placement1'],
          productId: 'product123',
        },
      };

      controller = buildProductEnrichment(engine, props);
      controller.getBadges();

      expect(fetchBadges).toHaveBeenCalledWith({
        placementIds: ['placement1'],
        productId: 'product123',
      });
    });

    it('throws error when called without placementIds', () => {
      controller = buildProductEnrichment(engine);

      expect(() => controller.getBadges()).toThrow(
        'placementIds must be provided and non-empty to fetch badges'
      );
    });
  });
});
