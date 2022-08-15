export const didYouMeanComponent = 'atomic-did-you-mean';
export const DidYouMeanSelectors = {
  shadow: () => cy.get(didYouMeanComponent).shadow(),
  noResults: () => DidYouMeanSelectors.shadow().find('[part="no-results"]'),
  autoCorrected: () =>
    DidYouMeanSelectors.shadow().find('[part="auto-corrected"]'),
  showingResultsFor: () =>
    DidYouMeanSelectors.shadow().find('[part="showing-results-for"]'),
  searchInsteadFor: () =>
    DidYouMeanSelectors.shadow().find('[part="search-instead-for"]'),
  correctionButton: () =>
    DidYouMeanSelectors.shadow().find('[part="correction-btn"]'),
  undoButton: () => DidYouMeanSelectors.shadow().find('[part="undo-btn"]'),
};
