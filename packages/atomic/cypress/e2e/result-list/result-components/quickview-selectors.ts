import {ResultListSelectors} from '../result-list-selectors';

export const quickviewComponent = 'atomic-quickview';
export const quickviewModalComponent = 'atomic-quickview-modal';
export const focusTrapComponent = 'atomic-focus-trap';

export const QuickviewSelectors = {
  shadow: () => cy.get(quickviewComponent),
  firstInResult: () =>
    ResultListSelectors.firstResult().find(quickviewComponent),
  button: () => QuickviewSelectors.firstInResult().shadow().find('button'),
};

export const QuickviewModalSelectors = {
  shadow: () => cy.get(quickviewComponent).shadow(),
  focusTrap: () =>
    QuickviewModalSelectors.shadow().find(focusTrapComponent, {
      includeShadowDom: true,
    }),
  focusTrapContainer: () =>
    QuickviewModalSelectors.focusTrap().shadow().find('[part="container"]'),
  closeButton: () =>
    QuickviewModalSelectors.shadow().find('[part="close-button"]'),
  footerButton: () =>
    QuickviewModalSelectors.shadow().find('[part="footer-button"]'),
  facets: () => cy.get(quickviewModalComponent).find('[slot="facets"]'),
};
