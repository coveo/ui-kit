export const querySummaryComponent = 'atomic-query-summary';
export const QuerySummarySelectors = {
  shadow: () => cy.get(querySummaryComponent).shadow(),
  text: () => QuerySummarySelectors.shadow().invoke('text'),
  placeholder: () =>
    QuerySummarySelectors.shadow().find('[part="placeholder"]'),
  container: () => QuerySummarySelectors.shadow().find('[part="container"]'),
};
