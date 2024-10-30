import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';

export const applyCorrection = createAction(
  'didYouMean/correction',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);
