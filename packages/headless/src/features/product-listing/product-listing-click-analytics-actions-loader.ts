import {ProductRecommendation} from '../../api/search/search/product-recommendation.js';
import {ProductListingEngine} from '../../app/product-listing-engine/product-listing-engine.js';
import {
  AnalyticsType,
  ProductListingAction,
} from '../analytics/analytics-utils.js';
import {logProductRecommendationOpen} from './product-listing-analytics.js';

/**
 * The click analytics action creators.
 */
export interface ClickAnalyticsActionCreators {
  /**
   * The event to log when a recommendation is selected.
   *
   * @param productRecommendation - The selected recommendation.
   * @returns A dispatchable action.
   */
  logProductRecommendationOpen(
    productRecommendation: ProductRecommendation
  ): ProductListingAction<AnalyticsType.Click>;
}

/**
 * Returns possible click analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadClickAnalyticsActions(
  engine: ProductListingEngine
): ClickAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logProductRecommendationOpen,
  };
}
