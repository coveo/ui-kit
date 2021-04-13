import {createAction} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
} from '../../utils/validate-payload';

/**
 * Enables did-you-mean.
 */
export const enableDidYouMean = createAction('didYouMean/enable');

/**
 * Disables did-you-mean.
 */
export const disableDidYouMean = createAction('didYouMean/disable');
/**
 * Applies a did-you-mean correction.
 * @param correction (string) The target correction (e.g., `"corrected string"`).
 */
export const applyDidYouMeanCorrection = createAction(
  'didYouMean/correction',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);

/**
 * Set the original query performed when a query correction is applied
 */
export const didYouMeanCorrectionReceived = createAction(
  'didYouMean/correctionReceived',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);
