import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';

export const enableDidYouMean = createAction('didYouMean/enable');

export const disableDidYouMean = createAction('didYouMean/disable');

export const applyDidYouMeanCorrection = createAction(
  'didYouMean/correction',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);
