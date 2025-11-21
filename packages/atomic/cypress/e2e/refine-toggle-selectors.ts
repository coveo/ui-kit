
export const refineToggleComponent = 'atomic-refine-toggle';
export const refineModalComponent = 'atomic-refine-modal';
export const focusTrapComponent = 'atomic-focus-trap';

export const RefineToggleSelectors = {
  shadow: () => cy.get(refineToggleComponent).shadow(),
  buttonOpen: () => RefineToggleSelectors.shadow().find('button'),
};

export const RefineModalSelectors = {
  shadow: () => cy.get(refineModalComponent).shadow(),
  focusTrap: () =>
    RefineModalSelectors.shadow().find(focusTrapComponent, {
      includeShadowDom: true,
    }),
  focusTrapContainer: () =>
    RefineModalSelectors.focusTrap().shadow().find('[part="container"]'),
  closeButton: () =>
    RefineModalSelectors.shadow().find('[part="close-button"]'),
  footerButton: () =>
    RefineModalSelectors.shadow().find('[part="footer-button"]'),
  facets: () => cy.get(refineModalComponent).find('[slot="facets"]'),
  filterSection: () =>
    RefineModalSelectors.shadow().find('[part="filter-section"]'),
};
