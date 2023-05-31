export const loadMoreResultsComponent = 'atomic-load-more-results';
export const LoadMoreResultsSelectors = {
  shadow: () => cy.get(loadMoreResultsComponent).shadow(),
  resultsRecap: () =>
    LoadMoreResultsSelectors.shadow().find('[part="showing-results"]'),
  progressBar: () =>
    LoadMoreResultsSelectors.shadow().find('[part="progress-bar"]'),
  button: () =>
    LoadMoreResultsSelectors.shadow().find('[part="load-more-results-button"]'),
};
