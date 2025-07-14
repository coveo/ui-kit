import type {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import type {InsightAction} from '../analytics/analytics-utils.js';
import {logExpandToFullUI} from './insight-analytics-actions.js';
import {logContextChanged} from './insight-search-analytics-actions.js';

/**
 * The Insight Search analytics action creators.
 *
 * @group Actions
 * @category InsightSearchAnalytics
 */
export interface InsightSearchAnalyticsActionCreators {
  /**
   * The event to log when the context is updated.
   *
   * @param caseId - The case ID.
   * @param caseNumber - The case number.
   * @returns A dispatchable action.
   */
  logContextChanged(caseId: string, caseNumber: string): InsightAction;

  /**
   * The event to log when the full search page is opened.
   *
   * @param caseId - The case ID.
   * @param caseNumber - The case number.
   * @param fullSearchComponentName - The name of the full search component to open.
   * @param triggeredBy - The action that triggered the event.
   * @returns A dispatchable action.
   */
  logExpandToFullUI(
    caseId: string,
    caseNumber: string,
    fullSearchComponentName: string,
    triggeredBy: string
  ): InsightAction;
}

/**
 * Loads the insight search analytics actions.
 * @param engine The insight engine.
 * @returns The available analytics actions.
 *
 * @group Actions
 * @category InsightSearchAnalytics
 */
export function loadInsightSearchAnalyticsActions(
  engine: InsightEngine
): InsightSearchAnalyticsActionCreators {
  engine.addReducers({});
  return {
    logContextChanged,
    logExpandToFullUI,
  };
}
