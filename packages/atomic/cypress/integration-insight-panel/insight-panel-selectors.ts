export const InsightPanelsSelectors = {
  interface: () => cy.get('atomic-insight-interface'),
  foldedResultList: () =>
    InsightPanelsSelectors.interface().find(
      'atomic-insight-folded-result-list'
    ),
  results: () =>
    InsightPanelsSelectors.foldedResultList()
      .shadow()
      .find('atomic-insight-result'),
  resultsPlaceholder: () =>
    InsightPanelsSelectors.foldedResultList()
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
  tabBar: () => InsightPanelsSelectors.tabs().find('atomic-tab-bar').shadow(),
  tabPopover: () =>
    InsightPanelsSelectors.tabBar().find('atomic-tab-popover').shadow(),
  tabPopoverButton: () =>
    InsightPanelsSelectors.tabPopover().find('[part="popover-button"]'),
  layoutStyleTags: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-layout > style'),
  topLevelStyleTags: () => cy.get('head > style'),
  smartSnippet: () =>
    InsightPanelsSelectors.interface().find('atomic-insight-smart-snippet'),
  smartSnippetExpandableAnswer: () =>
    InsightPanelsSelectors.smartSnippet()
      .shadow()
      .find('atomic-smart-snippet-expandable-answer'),
  smartSnippetSuggestions: () =>
    InsightPanelsSelectors.interface().find(
      'atomic-insight-smart-snippet-suggestions'
    ),
  smartSnippetFeedbackNoButton: () =>
    InsightPanelsSelectors.smartSnippet()
      .shadow()
      .find('[part="feedback-dislike-button"]'),
  smartSnippetsExplainWhyButton: () =>
    InsightPanelsSelectors.smartSnippet()
      .shadow()
      .find('[part="feedback-explain-why-button"]'),
  smartSnippetFeedbackModal: () =>
    InsightPanelsSelectors.interface().find(
      'atomic-insight-smart-snippet-feedback-modal'
    ),
  resultActionBar: () =>
    InsightPanelsSelectors.results()
      .shadow()
      .find('atomic-insight-result-action-bar'),
};
