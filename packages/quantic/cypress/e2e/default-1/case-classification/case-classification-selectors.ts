import {
  ComponentErrorSelector,
  ComponentSelector,
  CypressSelector,
} from '../../common-selectors';

export const caseClassificationComponent = 'c-quantic-case-classification';

export interface CaseClassificationSelector extends ComponentSelector {
  label: () => CypressSelector;
  selectTitle: () => CypressSelector;
  selectInput: () => CypressSelector;
  selectOption: (idx: number) => CypressSelector;
  inlineOptions: () => CypressSelector;
  suggestedOptions: () => CypressSelector;
  suggestedOption: (idx: number) => CypressSelector;
  inlineOption: (idx: number) => CypressSelector;
  suggestedOptionInput: (idx: number) => CypressSelector;
  inlineOptionInput: (idx: number) => CypressSelector;
  error: () => CypressSelector;
  loadingSpinner: () => CypressSelector;
}

export const CaseClassificationSelectors: CaseClassificationSelector &
  ComponentErrorSelector = {
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
    CaseClassificationSelectors.get().find(
      '[data-testid="case-classification-error-message"]'
    ),
  loadingSpinner: () =>
    CaseClassificationSelectors.get().find('lightning-spinner'),
  componentError: () =>
    CaseClassificationSelectors.get().find('c-quantic-component-error'),
  componentErrorMessage: () =>
    CaseClassificationSelectors.get().find(
      'c-quantic-component-error [data-cy="error-message"]'
    ),
};
