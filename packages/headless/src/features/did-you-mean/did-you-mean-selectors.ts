import type {DidYouMeanState as CommerceDidYouMeanState} from '../commerce/did-you-mean/did-you-mean-state.js';
import type {DidYouMeanState} from './did-you-mean-state.js';

export const hasQueryCorrectionSelector = (
  state: CommerceDidYouMeanState | DidYouMeanState
) => state.queryCorrection.correctedQuery !== '' || state.wasCorrectedTo !== '';
