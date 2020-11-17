import {createAction} from '@reduxjs/toolkit';
import {validatePayloadValue} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

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
  (payload: string) =>
    validatePayloadValue(
      payload,
      new StringValue({required: true, emptyAllowed: false})
    )
);
