import {createAction} from '@reduxjs/toolkit';

export const enableDidYouMean = createAction('didYouMean/enable');
export const disableDidYouMean = createAction('didYouMean/disable');
export const didYouMeanCorrection = createAction<string>(
  'didYouMean/correction'
);
