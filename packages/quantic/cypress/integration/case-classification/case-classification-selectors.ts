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
  loadingSpinner: () => CypressSelector;
}

export const CaseClassificationSelectors: CaseClassificationSelector = {
  get: () => cy.get(caseClassificationComponent),

  label: () =>
    CaseClassificationSelectors.get().find('.slds-form-element__legend'),
  selectTitle: () => CaseClassificationSelectors.get().find('lightning-button'),
  selectInput: () =>
    CaseClassificationSelectors.get().find('lightning-combobox'),
  selectOption: (idx: number) =>
    CaseClassificationSelectors.get()
      .find('lightning-base-combobox-item')
      .eq(idx),
  inlineOptions: () =>
    CaseClassificationSelectors.get().find('.case-classification-option'),
  suggestedOptions: () =>
    CaseClassificationSelectors.get().find('.case-classification-suggestion'),
  suggestedOption: (idx: number) =>
    CaseClassificationSelectors.get()
      .find('.case-classification-suggestion')
      .eq(idx),
  inlineOption: (idx: number) =>
    CaseClassificationSelectors.get()
      .find('.case-classification-option')
      .eq(idx),
  suggestedOptionInput: (idx: number) =>
    CaseClassificationSelectors.get()
      .find('.case-classification-suggestion input')
      .eq(idx),
  inlineOptionInput: (idx: number) =>
    CaseClassificationSelectors.get()
      .find('.case-classification-option input')
      .eq(idx),
  error: () =>
    CaseClassificationSelectors.get().find('.slds-form-element__help'),
  loadingSpinner: () =>
    CaseClassificationSelectors.get().find('lightning-spinner'),
};
