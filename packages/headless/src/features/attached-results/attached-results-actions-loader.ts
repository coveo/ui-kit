import {PayloadAction} from '@reduxjs/toolkit';
import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {attachedResults} from '../../app/reducers';
import {
  setAttachedResults,
  SetAttachedResultsActionCreatorPayload,
} from './attached-results-actions';

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
   * engine.dispatch(setAttachedResults(attachedResults, message));
   *
   * @param attachedResults - The attached results records corresponding to this record.
   * @param message - Optional message in case of error.
   * @returns A dispatchable action.
   */
  setAttachedResults(
    payload: SetAttachedResultsActionCreatorPayload
  ): PayloadAction<SetAttachedResultsActionCreatorPayload>;
}

export function loadAttachedResultsActions(
  engine: InsightEngine
): AttachedResultsActionCreators {
  engine.addReducers({attachedResults});

  return {
    setAttachedResults,
  };
}
