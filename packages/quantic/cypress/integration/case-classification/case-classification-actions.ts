import { CaseClassificationSelector, CaseClassificationSelectors } from './case-classification-selectors';

function caseClassificationActions(selector: CaseClassificationSelector) {
  return {
    clickSuggestion: (i: number) => selector.suggestedOption(i).click(),
    clickSelectTitle: () => selector.selectTitle().click(),
    openSelectInput: () => selector.selectInput().click(),
    clickSelectOption: (i: number) => selector.selectOption(i).click(),
  };
}

export const CaseClassificationActions = {
  ...caseClassificationActions(CaseClassificationSelectors),
};
