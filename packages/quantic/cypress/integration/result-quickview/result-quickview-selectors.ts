import {ComponentSelector, CypressSelector} from '../common-selectors';

export const resultQuickviewComponent = 'c-quantic-result-quickview';

export interface ResultQuickviewSelector extends ComponentSelector {
  buttonPreview: (variant?: string) => CypressSelector;
  buttonPreviewIcon: () => CypressSelector;
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
      ? ResultQuickviewSelectors.get().find('.slds-button_' + variant)
      : ResultQuickviewSelectors.get().find('.quickview__button-base'),
  buttonPreviewIcon: () =>
    ResultQuickviewSelectors.buttonPreview().find('lightning-icon'),
  sectionPreview: () => ResultQuickviewSelectors.get().find('section'),
  closeButton: () => ResultQuickviewSelectors.get().find('.slds-modal__close'),
  title: () => ResultQuickviewSelectors.get().find('c-quantic-result-link'),
  resultLabel: () =>
    ResultQuickviewSelectors.get().find('c-quantic-result-label'),
  resultLink: () =>
    ResultQuickviewSelectors.get().find('c-quantic-result-link'),
  resultDate: () =>
    ResultQuickviewSelectors.get().find('.quickview__result-date'),
};
