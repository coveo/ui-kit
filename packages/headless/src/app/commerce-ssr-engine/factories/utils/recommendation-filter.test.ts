import {describe, it, expect, vi} from 'vitest';
import {defineCart} from '../../../../controllers/commerce/context/cart/headless-cart.ssr.js';
import {defineSummary} from '../../../../controllers/commerce/core/summary/headless-core-summary.ssr.js';
import {defineProductList} from '../../../../controllers/commerce/product-list/headless-product-list.ssr.js';
import {
  defineRecommendations,
  Recommendations,
} from '../../../../controllers/commerce/recommendations/headless-recommendations.ssr.js';
import {defineSearchBox} from '../../../../controllers/commerce/search-box/headless-search-box.ssr.js';
import {Controller} from '../../../../controllers/controller/headless-controller.js';
import {MultipleRecommendationError} from '../../../../utils/errors.js';
import {ControllerDefinitionsMap} from '../../types/common.js';
import {filterRecommendationControllers} from './recommendation-filter.js';

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
});
