import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';

export const enableDidYouMean = createAction('didYouMean/enable');

export const disableDidYouMean = createAction('didYouMean/disable');

export const disableAutomaticQueryCorrection = createAction(
  'didYouMean/automaticCorrections/disable'
);

export const enableAutomaticQueryCorrection = createAction(
  'didYouMean/automaticCorrections/enable'
);

export const applyDidYouMeanCorrection = createAction(
  'didYouMean/correction',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);
