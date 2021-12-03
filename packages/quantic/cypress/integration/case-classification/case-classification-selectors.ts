import { ComponentSelector, CypressSelector } from '../common-selectors';

export const caseClassificationComponent = 'c-quantic-case-classification';

export interface CaseClassificationSelector extends ComponentSelector {
  label: () => CypressSelector;
  selectTitle: () => CypressSelector;
  selectInput: () => CypressSelector;
  selectOption: (i: number) => CypressSelector;
  suggestedOptions: () => CypressSelector;
  suggestedOption: (i: number) => CypressSelector;
  error: () => CypressSelector;
}

export const CaseClassificationSelectors: CaseClassificationSelector = {
  get: () => cy.get(caseClassificationComponent),

  label: () => CaseClassificationSelectors.get().find('.slds-form-element__legend'),
  selectTitle: () => CaseClassificationSelectors.get().find('lightning-button'),
  selectInput: () => CaseClassificationSelectors.get().find('lightning-combobox'),
  selectOption: (i: number) => CaseClassificationSelectors.get().find('lightning-base-combobox-item').eq(i),
  suggestedOptions: () => CaseClassificationSelectors.get().find('.slds-visual-picker'),
  suggestedOption: (i: number) => CaseClassificationSelectors.get().find('.slds-visual-picker').eq(i),


  error: () => CaseClassificationSelectors.get().find('.slds-form-element__help'),

};
