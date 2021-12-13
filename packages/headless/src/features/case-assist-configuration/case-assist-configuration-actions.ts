import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
  nonEmptyString,
} from '../../utils/validate-payload';

export interface SetCaseAssistConfigurationActionCreatorPayload {
  /**
   * The unique identifier of the target case assist configuration. See [Retrieving a Case Assist ID](https://docs.coveo.com/en/3328/service/manage-case-assist-configurations#retrieving-a-case-assist-id).
   */
  caseAssistId: string;
  /**
   * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
   */
  locale?: string;
}

export const setCaseAssistConfiguration = createAction(
  'caseAssistConfiguration/set',
  (payload: SetCaseAssistConfigurationActionCreatorPayload) =>
    validatePayload(payload, {
      caseAssistId: requiredNonEmptyString,
      locale: nonEmptyString,
    })
);
