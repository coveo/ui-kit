import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';

export const applyCorrection = createAction(
  'commerce/didYouMean/applyCorrection',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);
