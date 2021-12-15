import {ComponentSelector, CypressSelector} from '../common-selectors';

export const caseClassificationComponent = 'c-quantic-case-classification';

export interface CaseClassificationSelector extends ComponentSelector {
  label: () => CypressSelector;
  selectTitle: () => CypressSelector;
  selectInput: () => CypressSelector;
  selectOption: (i: number) => CypressSelector;
  inlineOptions: () => CypressSelector;
  suggestedOptions: () => CypressSelector;
  suggestedOption: (i: number) => CypressSelector;
  inlineOption: (i: number) => CypressSelector;
  suggestedOptionInput: (i: number) => CypressSelector;
  inlineOptionInput: (i: number) => CypressSelector;
  error: () => CypressSelector;
}

export const CaseClassificationSelectors: CaseClassificationSelector = {
  get: () => cy.get(caseClassificationComponent),

  label: () =>
    CaseClassificationSelectors.get().find('.slds-form-element__legend'),
  selectTitle: () => CaseClassificationSelectors.get().find('lightning-button'),
  selectInput: () =>
    CaseClassificationSelectors.get().find('lightning-combobox'),
  selectOption: (i: number) =>
    CaseClassificationSelectors.get()
      .find('lightning-base-combobox-item')
      .eq(i),
  inlineOptions: () =>
    CaseClassificationSelectors.get().find('.case-classification-option'),
  suggestedOptions: () =>
    CaseClassificationSelectors.get().find('.case-classification-suggestion'),
  suggestedOption: (i: number) =>
    CaseClassificationSelectors.get()
      .find('.case-classification-suggestion')
      .eq(i),
  inlineOption: (i: number) =>
    CaseClassificationSelectors.get().find('.case-classification-option').eq(i),
  suggestedOptionInput: (i: number) =>
    CaseClassificationSelectors.get()
      .find('.case-classification-suggestion input')
      .eq(i),
  inlineOptionInput: (i: number) =>
    CaseClassificationSelectors.get()
      .find('.case-classification-option input')
      .eq(i),
  error: () =>
    CaseClassificationSelectors.get().find('.slds-form-element__help'),
};
