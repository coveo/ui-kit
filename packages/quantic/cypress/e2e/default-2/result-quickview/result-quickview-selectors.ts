import {ComponentSelector, CypressSelector} from '../../common-selectors';

export const resultQuickviewComponent = 'c-quantic-result-quickview';

export interface ResultQuickviewSelector extends ComponentSelector {
  buttonPreview: () => CypressSelector;
  buttonPreviewContainer: () => CypressSelector;
  buttonPreviewIcon: () => CypressSelector;
  sectionPreview: () => CypressSelector;
  closeButton: () => CypressSelector;
  title: () => CypressSelector;
  resultLabel: () => CypressSelector;
  resultLink: () => CypressSelector;
  resultDate: () => CypressSelector;
  contentContainer: () => CypressSelector;
  spinner: () => CypressSelector;
  tooltip: () => CypressSelector;
}

export const ResultQuickviewSelectors: ResultQuickviewSelector = {
  get: () => cy.get(resultQuickviewComponent),

  buttonPreviewContainer: () =>
    ResultQuickviewSelectors.get().find(
      '[data-cy="quick-view-button__container"]'
    ),
  buttonPreview: () =>
    ResultQuickviewSelectors.get().find('[data-cy="quick-view-button"]'),
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
  contentContainer: () =>
    ResultQuickviewSelectors.get().find('.quickview__content-container'),
  spinner: () =>
    ResultQuickviewSelectors.get().find(
      '.quickview__content-container .iframe-wrapper .quickview__spinner-container'
    ),
  tooltip: () => ResultQuickviewSelectors.get().find('[data-cy="tooltip"]'),
};
