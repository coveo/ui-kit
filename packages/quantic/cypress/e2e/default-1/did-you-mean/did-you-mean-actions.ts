import {
  DidYouMeanSelector,
  DidYouMeanSelectors,
} from './did-you-mean-selectors';

function didYouMeanActions(selector: DidYouMeanSelector) {
  return {
    clickUndoButton: () => selector.undoButton().click(),
    applyCorrection: () => selector.applyCorrectionButton().click(),
  };
}

export const DidYouMeanActions = {
  ...didYouMeanActions(DidYouMeanSelectors),
};
