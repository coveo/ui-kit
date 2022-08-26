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
  pager: () => InsightPanelsSelectors.interface().find('atomic-insight-pager'),
  querySummary: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-query-summary'),
  searchbox: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-search-box'),
  refineToggle: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-refine-toggle'),
  refineModal: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-refine-modal'),
  filtersModal: () =>
    InsightPanelsSelectors.refineModal().shadow().find('atomic-modal'),
  filters: () => InsightPanelsSelectors.refineModal().find('[slot~="facets"]'),
  editToggle: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-edit-toggle'),
  historyToggle: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-history-toggle'),
  tabs: () => InsightPanelsSelectors.interface().find('atomic-insight-tabs'),
};
