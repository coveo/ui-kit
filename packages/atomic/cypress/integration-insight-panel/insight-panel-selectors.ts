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
  focusTrap: () =>
    InsightPanelsSelectors.refineModal().shadow().find('atomic-focus-trap', {
      includeShadowDom: true,
    }),
  filtersModal: () =>
    InsightPanelsSelectors.refineModal().shadow().find('atomic-modal'),
  filters: () => InsightPanelsSelectors.refineModal().find('[slot~="facets"]'),
  editToggle: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-edit-toggle'),
  historyToggle: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-history-toggle'),
  fullSearchButton: () =>
    InsightPanelsSelectors.interface().find(
      'atomic-insight-full-search-button'
    ),
  tabs: () => InsightPanelsSelectors.interface().find('atomic-insight-tabs'),
  tabBar: () => InsightPanelsSelectors.tabs().find('tab-bar').shadow(),
  tabPopover: () =>
    InsightPanelsSelectors.tabBar().find('tab-popover').shadow(),
  tabPopoverButton: () =>
    InsightPanelsSelectors.tabPopover().find('[part="popover-button"]'),
  layoutStyleTags: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-layout > style'),
  topLevelStyleTags: () => cy.get('style[data-styles]'),
};
