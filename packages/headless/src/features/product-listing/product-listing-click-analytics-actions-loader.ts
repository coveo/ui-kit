import {ProductRecommendation} from '../../api/search/search/product-recommendation';
import {ProductListingEngine} from '../../app/product-listing-engine/product-listing-engine';
import {ProductListingAction} from '../analytics/analytics-utils';
import {logProductRecommendationOpen} from './product-listing-analytics';

/**
 * The click analytics action creators.
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
 */
export interface ClickAnalyticsActionCreators {
  /**
   * The event to log when a recommendation is selected.
   *
   * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
   * @deprecated
   *
   * @param productRecommendation - The selected recommendation.
   * @returns A dispatchable action.
   */
  logProductRecommendationOpen(
    productRecommendation: ProductRecommendation
  ): ProductListingAction;
}

/**
 * Returns possible click analytics action creators.
 *
 * Deprecated. The `product-listing` sub-package is deprecated. Use the `commerce` sub-package instead.
 * @deprecated
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
