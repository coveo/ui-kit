import {ComponentSelector, CypressSelector} from '../common-selectors';

export const resultQuickviewComponent = 'c-quantic-result-quickview';

export interface ResultQuickviewSelector extends ComponentSelector {
  buttonPreview: (variant?: string) => CypressSelector;
  sectionPreview: () => CypressSelector;
  closeButton: () => CypressSelector;
  title: () => CypressSelector;
  resultLabel: () => CypressSelector;
  resultLink: () => CypressSelector;
  resultDate: () => CypressSelector;
}

export const ResultQuickviewSelectors: ResultQuickviewSelector = {
  get: () => cy.get(resultQuickviewComponent),

  buttonPreview: (variant?: string) =>
    variant
      ? ResultQuickviewSelectors.get().find(variant)
      : ResultQuickviewSelectors.get().find('.quickview__button-base'),
  sectionPreview: () => ResultQuickviewSelectors.get().find('section'),
  closeButton: () => ResultQuickviewSelectors.get().find('.slds-modal__close'),
  title: () => ResultQuickviewSelectors.get().find('h3 .slds-modal__title'),
  resultLabel: () =>
    ResultQuickviewSelectors.get().find('c-quantic-result-label'),
  resultLink: () =>
    ResultQuickviewSelectors.get().find('c-quantic-result-link'),
  resultDate: () =>
    ResultQuickviewSelectors.get().find('.quickview__result-date'),
};
