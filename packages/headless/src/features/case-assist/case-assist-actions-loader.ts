import {PayloadAction} from '@reduxjs/toolkit';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {caseAssist} from '../../app/reducers';
import {
  setCaseAssistId,
  SetCaseAssistIdActionCreatorPayload,
} from './case-assist-actions';

export {SetCaseAssistIdActionCreatorPayload};

/**
 * The case assist action creators.
 */
export interface CaseAssistActionCreators {
  /**
   * Updates the case assist identifier.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setCaseAssistId(
    payload: SetCaseAssistIdActionCreatorPayload
  ): PayloadAction<SetCaseAssistIdActionCreatorPayload>;
}

/**
 * Loads the `case assist` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadCaseAssistActions(
  engine: CaseAssistEngine
): CaseAssistActionCreators {
  engine.addReducers({caseAssist});

  return {
    setCaseAssistId,
  };
}
