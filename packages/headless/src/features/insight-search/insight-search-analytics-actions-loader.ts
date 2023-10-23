import {InsightEngine} from '../../insight.index';
import {InsightAction} from '../analytics/analytics-utils';
import {
  logContextChanged,
  logExpandToFullUI,
} from './insight-search-analytics-actions';

/**
 * The Insight Search analytics action creators.
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
