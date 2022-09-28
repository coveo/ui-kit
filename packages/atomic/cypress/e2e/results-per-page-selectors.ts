export const resultsPerPageComponent = 'atomic-results-per-page';
export const ResultsPerPageSelectors = {
  shadow: () => cy.get(resultsPerPageComponent).shadow(),
  buttons: () =>
    ResultsPerPageSelectors.shadow().find('[part="buttons"]').children(),
  activeButton: () => ResultsPerPageSelectors.buttons().filter(':checked'),
};
