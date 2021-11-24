import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';

export interface SetCaseInputActionCreatorPayload {
  /**
   * The name of the field whose value is being updated (e.g., subject, description, product, category).
   */
  fieldName: string;
  /**
   * The value to set in the state.
   */
  fieldValue: string;
}

/**
 * Adds or updates the state caseInputs with the specified field and value.
 */
export const setCaseInput = createAction(
  'caseAssist/caseInput/set',
  (payload: SetCaseInputActionCreatorPayload) =>
    validatePayload(payload, {
      fieldName: requiredNonEmptyString,
      fieldValue: requiredNonEmptyString,
    })
);
