import {createSelector} from '@reduxjs/toolkit';
import {DidYouMeanState as CommerceDidYouMeanState} from '../commerce/did-you-mean/did-you-mean-state.js';
import {DidYouMeanState} from './did-you-mean-state.js';

export const hasQueryCorrectionSelector = createSelector(
  (state: CommerceDidYouMeanState | DidYouMeanState) =>
    state.queryCorrection.correctedQuery !== '' || state.wasCorrectedTo !== '',
  (hasQueryCorrection) => hasQueryCorrection
);
