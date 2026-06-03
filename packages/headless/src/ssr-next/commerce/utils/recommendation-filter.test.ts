import {describe, expect, it, vi} from 'vitest';
import type {Controller} from '../../../controllers/controller/headless-controller.js';
import {
  defineMockCommerceController,
  defineMockRecommendationDefinition,
} from '../../../test/mock-ssr-controller-definitions.js';
import {MultipleRecommendationError} from '../../common/errors.js';
import {defineCart} from '../controllers/cart/headless-cart.ssr.js';
import {defineProductList} from '../controllers/product-list/headless-product-list.ssr.js';
import {
  defineRecommendations,
  type Recommendations,
} from '../controllers/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
import {defineSummary} from '../controllers/summary/headless-core-summary.ssr.js';
import type {ControllerDefinitionsMap} from '../types/controller-definitions.js';
import {
  filterRecommendationControllers,
  isRecommendationDefinition,
} from './recommendation-filter.js';

describe('filterRecommendationControllers', () => {
  const mockRefresh = vi.fn();
  const mockController = {
    refresh: mockRefresh,
  } as unknown as Controller;

  const mockRecommendationController = {
    refresh: mockRefresh,
  } as unknown as Recommendations;

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when filtering a controller definition with recommendation and non-recommendation controller types', () => {
    const controllerDefinition = {
      // Recommendation controllers
      rec1: defineRecommendations({options: {slotId: 'slot-id-1'}}),
      rec2: defineRecommendations({options: {slotId: 'slot-id-2'}}),
      // Non recommendation controllers
      summary: defineSummary(),
      productList: defineProductList(),
      cart: defineCart(),
      searchBox: defineSearchBox(),
    };

    const {refresh} = filterRecommendationControllers(
      {
        rec1: mockRecommendationController,
        rec2: mockRecommendationController,
        summary: mockController,
        productList: mockController,
        cart: mockController,
        searchBox: mockController,
      },
      controllerDefinition
    );

    it('should refresh specified recommendation only', () => {
      refresh(['rec1']);
      expect(mockRecommendationController.refresh).toHaveBeenCalledTimes(1);
    });

    it('should refresh multiple specified recommendations', () => {
      refresh(['rec1', 'rec2']);
      expect(mockRecommendationController.refresh).toHaveBeenCalledTimes(2);
    });

    it('should not refresh if no recommendations are specified', () => {
      refresh([]);
      expect(mockRecommendationController.refresh).not.toHaveBeenCalled();
    });

    it('should not refresh non-recommendation controllers', () => {
      refresh(['summary', 'productList']);
      expect(mockRecommendationController.refresh).not.toHaveBeenCalled();
      expect(
        (mockController as {refresh?: Function}).refresh
      ).not.toHaveBeenCalled();
    });

    it('should not refresh if the whitelist is undefined', () => {
      refresh(undefined);
      expect(mockRecommendationController.refresh).not.toHaveBeenCalled();
    });
  });

  it('should throw an error if multiple recommendation controllers have the same slotId', () => {
    const duplicateSlotIdDefinitions: ControllerDefinitionsMap<Controller> = {
      controller1: defineRecommendations({options: {slotId: 'same-slot-id'}}),
      controller2: defineRecommendations({options: {slotId: 'same-slot-id'}}),
    };

    expect(() =>
      filterRecommendationControllers(
        {controller1: mockController, controller2: mockController},
        duplicateSlotIdDefinitions
      )
    ).toThrowError(MultipleRecommendationError);
  });

  describe('#isRecommendationDefinition', () => {
    it('should return true for valid recommendation definition', () => {
      const definition = defineMockRecommendationDefinition('slot_1');
      expect(isRecommendationDefinition(definition)).toBe(true);
    });

    it('should return false for non recommendation definition', () => {
      const definition = defineMockCommerceController();
      expect(isRecommendationDefinition(definition)).toBe(false);
    });
  });
});
