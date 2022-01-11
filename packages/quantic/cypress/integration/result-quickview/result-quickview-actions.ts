import {
  ResultQuickviewSelector,
  ResultQuickviewSelectors,
} from './result-quickview-selectors';

const resultQuickviewActions = (selector: ResultQuickviewSelector) => {
  return {
    clickPreview: () =>
      selector
        .buttonPreview()
        .click()
        .logAction('When clicking preview button'),
  };
};

export const ResultQuickviewActions = {
  ...resultQuickviewActions(ResultQuickviewSelectors),
};
