export const InsightPanelsSelectors = {
  interface: () => cy.get('atomic-insight-interface'),
  resultList: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-result-list'),
  results: () =>
    InsightPanelsSelectors.resultList().shadow().find('atomic-insight-result'),
  resultsPlaceholder: () =>
    InsightPanelsSelectors.resultList()
      .shadow()
      .find('atomic-result-placeholder'),
};
