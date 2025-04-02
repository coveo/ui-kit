import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
  requiredEmptyAllowedString,
} from '../../utils/validate-payload.js';

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

export const updateCaseInput = createAction(
  'caseAssist/caseInput/update',
  (payload: SetCaseInputActionCreatorPayload) =>
    validatePayload(payload, {
      fieldName: requiredNonEmptyString,
      fieldValue: requiredEmptyAllowedString,
    })
);
