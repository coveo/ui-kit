export const didYouMeanComponent = 'atomic-did-you-mean';
export const DidYouMeanSelectors = {
  shadow: () => cy.get(didYouMeanComponent).shadow(),
  noResults: () => DidYouMeanSelectors.shadow().find('[part="no-results"]'),
  noResultsOriginalQuery: () =>
    DidYouMeanSelectors.noResults().find('[part~="highlight"]'),
  autoCorrected: () =>
    DidYouMeanSelectors.shadow().find('[part="auto-corrected"]'),
  autoCorrectedNewQuery: () =>
    DidYouMeanSelectors.autoCorrected().find('[part~="highlight"]'),
  showingResultsFor: () =>
    DidYouMeanSelectors.shadow().find('[part="showing-results-for"]'),
  showingResultsForNewQuery: () =>
    DidYouMeanSelectors.showingResultsFor().find('[part="highlight"]'),
  searchInsteadFor: () =>
    DidYouMeanSelectors.shadow().find('[part="search-instead-for"]'),
  didYouMean: () => DidYouMeanSelectors.shadow().find('[part="did-you-mean"]'),
  correctionButton: () =>
    DidYouMeanSelectors.shadow().find('[part="correction-btn"]'),
  undoButton: () => DidYouMeanSelectors.shadow().find('[part="undo-btn"]'),
};
