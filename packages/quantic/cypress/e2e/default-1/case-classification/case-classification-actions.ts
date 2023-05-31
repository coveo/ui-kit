import {
  CaseClassificationSelector,
  CaseClassificationSelectors,
} from './case-classification-selectors';

function caseClassificationActions(selector: CaseClassificationSelector) {
  return {
    clickSuggestion: (idx: number) =>
      selector
        .suggestedOption(idx)
        .click()
        .logAction('When clicking on the suggestion at the specified index'),
    clickInlineOption: (idx: number) =>
      selector
        .inlineOption(idx)
        .click()
        .logAction('When clicking the inline option at the specified index'),
    clickSelectTitle: () =>
      selector
        .selectTitle()
        .click()
        .logAction('When clicking on the select title'),
    openSelectInput: () =>
      selector
        .selectInput()
        .click()
        .logAction('When clicking on the select input to open the options'),
    clickSelectOption: (idx: number) =>
      selector
        .selectOption(idx)
        .click()
        .logAction('When clicking on the select option at the specified index'),
    reportValidity: () =>
      selector
        .get()
        .then((el) => {
          el[0].reportValidity();
        })
        .logAction('When reporting the validity of the input'),
  };
}

export const CaseClassificationActions = {
  ...caseClassificationActions(CaseClassificationSelectors),
};
