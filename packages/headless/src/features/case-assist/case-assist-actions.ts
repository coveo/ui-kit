import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';

export interface SetCaseAssistIdActionCreatorPayload {
  /**
   * The case assist identifier.
   */
  id: string;
}

/**
 * Set case assist identifier.
 */
export const setCaseAssistId = createAction(
  'caseAssist/set',
  (payload: SetCaseAssistIdActionCreatorPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
    })
);
