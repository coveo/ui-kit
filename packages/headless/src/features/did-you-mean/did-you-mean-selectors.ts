import {createSelector} from '@reduxjs/toolkit';
import type {DidYouMeanState as CommerceDidYouMeanState} from '../commerce/did-you-mean/did-you-mean-state.js';
import type {DidYouMeanState} from './did-you-mean-state.js';

export const hasQueryCorrectionSelector = createSelector(
  (state: CommerceDidYouMeanState | DidYouMeanState) =>
    state.queryCorrection.correctedQuery !== '' || state.wasCorrectedTo !== '',
  (hasQueryCorrection) => hasQueryCorrection
);
