import {createSelector} from '@reduxjs/toolkit';
import {DidYouMeanState as CommerceDidYouMeanState} from '../commerce/did-you-mean/did-you-mean-state';
import {DidYouMeanState} from './did-you-mean-state';

export const hasQueryCorrectionSelector = createSelector(
  (state: CommerceDidYouMeanState | DidYouMeanState) =>
    state.queryCorrection.correctedQuery !== '' || state.wasCorrectedTo !== '',
  (hasQueryCorrection) => hasQueryCorrection
);
