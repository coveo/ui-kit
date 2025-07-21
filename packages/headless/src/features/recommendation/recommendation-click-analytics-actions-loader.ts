import type {Result} from '../../api/search/search/result.js';
import type {RecommendationEngine} from '../../app/recommendation-engine/recommendation-engine.js';
import type {ClickAction} from '../analytics/analytics-utils.js';
import {logRecommendationOpen} from './recommendation-analytics-actions.js';

/**
 * The click analytics action creators.
 */
export interface ClickAnalyticsActionCreators {
  /**
   * The event to log when a recommendation is selected.
   *
   * @param recommendation - The selected recommendation.
   * @returns A dispatchable action.
   */
  logRecommendationOpen(recommendation: Result): ClickAction;
}

/**
 * Returns possible click analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadClickAnalyticsActions(
  engine: RecommendationEngine
): ClickAnalyticsActionCreators {
  engine.addReducers({});

  return {
    logRecommendationOpen,
  };
}
