import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';

interface SetInsightConfigurationActionCreatorPayload {
  /**
   * The unique identifier of the target insight configuration.
   */
  insightId: string;
}

export const setInsightConfiguration = createAction(
  'insightConfiguration/set',
  (payload: SetInsightConfigurationActionCreatorPayload) =>
    validatePayload(payload, {insightId: requiredNonEmptyString})
);
