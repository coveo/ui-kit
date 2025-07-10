import type {PayloadAction} from '@reduxjs/toolkit';
import type {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import {attachedResultsReducer as attachedResults} from '../../features/attached-results/attached-results-slice.js';
import {
  type SetAttachedResultsActionCreatorPayload,
  setAttachedResults,
} from './attached-results-actions.js';
import type {AttachedResult} from './attached-results-state.js';

export type {SetAttachedResultsActionCreatorPayload, AttachedResult};

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
  };
}
