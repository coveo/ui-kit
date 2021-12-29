import {
  CaseClassificationSelector,
  CaseClassificationSelectors,
} from './case-classification-selectors';

function caseClassificationActions(selector: CaseClassificationSelector) {
  return {
    clickSuggestion: (idx: number) => selector.suggestedOption(idx).click(),
    clickInlineOption: (idx: number) => selector.inlineOption(idx).click(),
    clickSelectTitle: () => selector.selectTitle().click(),
    openSelectInput: () => selector.selectInput().click(),
    clickSelectOption: (idx: number) => selector.selectOption(idx).click(),
    reportValidity: () =>
      selector.get().then((el) => {
        el[0].reportValidity();
      }),
  };
}

export const CaseClassificationActions = {
  ...caseClassificationActions(CaseClassificationSelectors),
};
