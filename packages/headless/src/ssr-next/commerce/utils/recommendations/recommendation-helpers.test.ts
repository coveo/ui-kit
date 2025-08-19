import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {Controller} from '../../../../controllers/controller/headless-controller.js';
import {defineCart} from '../../controllers/cart/headless-cart.ssr.js';
import {defineProductList} from '../../controllers/product-list/headless-product-list.ssr.js';
import {
  defineRecommendations,
  type Recommendations,
} from '../../controllers/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../../controllers/search-box/headless-search-box.ssr.js';
import {defineSummary} from '../../controllers/summary/headless-core-summary.ssr.js';
import type {ControllerDefinitionsMap} from '../../types/controller-definitions.js';
import {
  getRecommendationDefinitions,
  refreshRecommendationControllers,
} from './recommendation-helpers.js';

describe('recommendation-helpers', () => {
  const mockRefresh = vi.fn();

  const mockRecommendationController = {
    refresh: mockRefresh,
  } as unknown as Recommendations;

  const mockNonRecommendationController = {
    someMethod: vi.fn(),
  } as unknown as Controller;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('#getRecommendationDefinitions', () => {
    it('should extract only recommendation controller definitions', () => {
      const controllerDefinitions: ControllerDefinitionsMap<Controller> = {
        // Recommendation controllers
        popularViewed: defineRecommendations({
          options: {slotId: 'slot-id-1'},
        }),
        recentlyViewed: defineRecommendations({
          options: {slotId: 'slot-id-2'},
        }),
        // Non-recommendation controllers
        summary: defineSummary(),
        productList: defineProductList(),
        cart: defineCart(),
        searchBox: defineSearchBox(),
      };

      const result = getRecommendationDefinitions(controllerDefinitions);

      expect(Object.keys(result)).toEqual(['popularViewed', 'recentlyViewed']);
      expect(result.popularViewed).toBe(controllerDefinitions.popularViewed);
      expect(result.recentlyViewed).toBe(controllerDefinitions.recentlyViewed);
    });

    it('should return empty object when no recommendation definitions exist', () => {
      const controllerDefinitions: ControllerDefinitionsMap<Controller> = {
        summary: defineSummary(),
        productList: defineProductList(),
        cart: defineCart(),
      };

      const result = getRecommendationDefinitions(controllerDefinitions);

      expect(result).toEqual({});
      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should return empty object when controller definitions map is empty', () => {
      const controllerDefinitions: ControllerDefinitionsMap<Controller> = {};

      const result = getRecommendationDefinitions(controllerDefinitions);

      expect(result).toEqual({});
      expect(Object.keys(result)).toHaveLength(0);
    });
  });

  describe('#refreshRecommendationControllers', () => {
    const recommendationDefinitions = {
      popularViewed: defineRecommendations({
        options: {slotId: 'slot-id-1'},
      }),
      recentlyViewed: defineRecommendations({
        options: {slotId: 'slot-id-2'},
      }),
    };

    const controllers = {
      popularViewed: mockRecommendationController,
      recentlyViewed: mockRecommendationController,
      summary: mockNonRecommendationController,
      productList: mockNonRecommendationController,
    };

    it('should refresh specified recommendation controllers', () => {
      refreshRecommendationControllers(controllers, recommendationDefinitions, [
        'popularViewed',
      ]);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should refresh multiple specified recommendation controllers', () => {
      refreshRecommendationControllers(controllers, recommendationDefinitions, [
        'popularViewed',
        'recentlyViewed',
      ]);

      expect(mockRefresh).toHaveBeenCalledTimes(2);
    });

    it('should not refresh controllers when controllerNames is empty array', () => {
      refreshRecommendationControllers(
        controllers,
        recommendationDefinitions,
        []
      );

      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('should only refresh controllers that exist in recommendation definitions', () => {
      refreshRecommendationControllers(controllers, recommendationDefinitions, [
        'popularViewed',
        'nonExistentController',
        'summary',
      ]);

      // Only popularViewed should be refreshed since it's the only valid recommendation controller
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should skip controllers that do not exist in the controllers record', () => {
      const partialControllers = {
        popularViewed: mockRecommendationController,
        // recentlyViewed is missing from controllers but exists in definitions
      };

      refreshRecommendationControllers(
        partialControllers,
        recommendationDefinitions,
        ['popularViewed', 'recentlyViewed']
      );

      // Only popularViewed should be refreshed since recentlyViewed doesn't exist in controllers
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should not refresh controllers that are not recommendation controllers', () => {
      const mockNonRecommendationWithRefresh = {
        refresh: vi.fn(),
        someOtherMethod: vi.fn(),
      } as unknown as Controller & {refresh: () => void};

      const controllersWithNonRec = {
        popularViewed: mockRecommendationController,
        summary: mockNonRecommendationWithRefresh,
      };

      refreshRecommendationControllers(
        controllersWithNonRec,
        recommendationDefinitions,
        ['popularViewed']
      );

      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(mockNonRecommendationWithRefresh.refresh).not.toHaveBeenCalled();
    });

    it('should handle empty recommendation definitions gracefully', () => {
      refreshRecommendationControllers(controllers, {}, [
        'popularViewed',
        'recentlyViewed',
      ]);

      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });
});
