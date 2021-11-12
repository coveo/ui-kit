import {createAction} from '@reduxjs/toolkit';
import {
  ConfigurationSection,
  CaseAssistSection,
} from '../../state/state-sections';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';
import {CaseAssistAppState} from '../../state/case-assist-app-state';

export type StateNeededByGetRecommendations = ConfigurationSection &
  CaseAssistSection &
  Partial<CaseAssistAppState>;

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
