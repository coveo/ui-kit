import {Result} from '../../api/search/search/result';
import {RecommendationEngine} from '../../app/recommendation-engine/recommendation-engine';
import {ClickAction} from '../analytics/analytics-utils';
import {logRecommendationOpen} from './recommendation-analytics-actions';

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
