import type {PayloadAction} from '@reduxjs/toolkit';
import type {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine.js';
import {caseInputReducer as caseInput} from '../../features/case-input/case-input-slice.js';
import {
  type SetCaseInputActionCreatorPayload,
  updateCaseInput,
} from './case-input-actions.js';

export type {SetCaseInputActionCreatorPayload};

/**
 * The case inputs action creators.
 *
 * @group Actions
 * @category CaseInput
 */
export interface CaseInputActionCreators {
  /**
   * Adds or updates the state caseInputs with the specified field and value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCaseInput(
    payload: SetCaseInputActionCreatorPayload
  ): PayloadAction<SetCaseInputActionCreatorPayload>;
}

/**
 * Loads the `case inputs` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category CaseInput
 */
export function loadCaseInputActions(
  engine: CaseAssistEngine
): CaseInputActionCreators {
  engine.addReducers({caseInput});

  return {
    updateCaseInput,
  };
}
