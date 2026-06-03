import type {Result} from '../../api/search/search/result.js';
import type {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import type {InsightAction} from '../analytics/analytics-utils.js';
import {
  logCaseAttach,
  logCaseDetach,
} from './attached-results-analytics-actions.js';
import {attachedResultsReducer as attachedResults} from './attached-results-slice.js';

/**
 * The attached results action creators.
 *
 * @group Actions
 * @category AttachedResults
 */
export interface AttachedResultsAnalyticsActionCreators {
  /**
   * Creates an analytics action for when a case attach event occurs.
   *
   * @param result - The result to attach.
   * @returns A dispatchable action.
   */
  logCaseAttach(result: Result): InsightAction;
  /**
   * Creates an analytics action for when a case detach event occurs.
   *
   * @param result - The result to detach.
   * @returns A dispatchable action.
   */
  logCaseDetach(result: Result): InsightAction;
}

/**
 * Loads the `attachedResults` reducer and returns possible analytics action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the analytics action creators.
 *
 * @group Actions
 * @category AttachedResults
 */
export function loadAttachedResultsAnalyticsActions(
  engine: InsightEngine
): AttachedResultsAnalyticsActionCreators {
  engine.addReducers({attachedResults});

  return {
    logCaseDetach,
    logCaseAttach,
  };
}
