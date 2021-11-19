import {PayloadAction} from '@reduxjs/toolkit';
import {CaseAssistEngine} from '../../app/case-assist-engine/case-assist-engine';
import {caseInputs} from '../../app/reducers';
import {
  setCaseInput,
  SetCaseInputActionCreatorPayload,
} from './case-inputs-actions';

export {SetCaseInputActionCreatorPayload};

/**
 * The case inputs action creators.
 */
export interface CaseInputsActionCreators {
  /**
   * Adds or updates the state caseInputs with the specified field and value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setCaseInput(
    payload: SetCaseInputActionCreatorPayload
  ): PayloadAction<SetCaseInputActionCreatorPayload>;
}

/**
 * Loads the `case inputs` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadCaseInputsActions(
  engine: CaseAssistEngine
): CaseInputsActionCreators {
  engine.addReducers({caseInputs});

  return {
    setCaseInput,
  };
}
