import {createAction} from '@reduxjs/toolkit';

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
export const didYouMeanCorrection = createAction<string>(
  'didYouMean/correction'
);
