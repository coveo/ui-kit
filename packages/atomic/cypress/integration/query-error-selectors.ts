export const queryErrorComponent = 'atomic-query-error';
export const QueryErrorSelectors = {
  shadow: () => cy.get(queryErrorComponent).shadow(),
  moreInfoBtn: () =>
    QueryErrorSelectors.shadow().find('[part="more-info-btn"]'),
  moreInfoMessage: () =>
    QueryErrorSelectors.shadow().find('[part="error-info"]'),
  icon: () => QueryErrorSelectors.shadow().find('atomic-icon'),
  errorTitle: () => QueryErrorSelectors.shadow().find('[part="title"]'),
  errorDescription: () =>
    QueryErrorSelectors.shadow().find('[part="description"]'),
};
