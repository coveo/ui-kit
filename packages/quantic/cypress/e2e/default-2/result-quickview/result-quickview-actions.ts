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

    hoverOverPreview: () =>
      selector
        .buttonPreviewContainer()
        .trigger('mouseenter')
        .logAction('When hovering over the preview button'),
  };
};

export const ResultQuickviewActions = {
  ...resultQuickviewActions(ResultQuickviewSelectors),
};
