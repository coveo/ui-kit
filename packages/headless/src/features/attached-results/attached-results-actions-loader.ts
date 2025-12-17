import type {PayloadAction} from '@reduxjs/toolkit';
import type {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import {
  attachResult,
  detachResult,
  type SetAttachedResultsActionCreatorPayload,
  setAttachedResults,
} from './attached-results-actions.js';
import {attachedResultsReducer as attachedResults} from './attached-results-slice.js';
import type {AttachedResult} from './attached-results-state.js';

/**
 * The attached results action creators.
 *
 * @group Actions
 * @category AttachedResults
 */
export interface AttachedResultsActionCreators {
  /**
   * Creates an action that sets the attached results to a record.
   *
   * @example
   *
   * ```js
   * const {setAttachedResults} = loadInsightAttachedResultsActions(engine);
   * ```
   *
   * engine.dispatch(setAttachedResults(attachedResults, loading));
   *
   * @param attachedResults - The attached results records corresponding to this record.
   * @param loading - Optional state of loading.
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setAttachedResults(
    payload: SetAttachedResultsActionCreatorPayload
  ): PayloadAction<SetAttachedResultsActionCreatorPayload>;

  /**
   * Creates an action that attaches a result to a case.
   *
   * @param payload - The action creator payload containing the result to attach.
   * @returns A dispatchable action.
   */
  attachResult(payload: AttachedResult): PayloadAction<AttachedResult>;

  /**
   * Creates an action that detaches a result from a case.
   *
   * @param payload - The action creator payload containing the result to detach.
   * @returns A dispatchable action.
   */
  detachResult(payload: AttachedResult): PayloadAction<AttachedResult>;
}

/**
 * Loads the `attachedResults` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category AttachedResults
 */
export function loadAttachedResultsActions(
  engine: InsightEngine
): AttachedResultsActionCreators {
  engine.addReducers({attachedResults});

  return {
    setAttachedResults,
    detachResult,
    attachResult,
  };
}
