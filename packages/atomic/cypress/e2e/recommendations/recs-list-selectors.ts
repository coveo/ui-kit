export const recsListComponent = 'atomic-recs-list';
export const resultPlaceholderComponent = 'atomic-result-placeholder';
export const resultTemplateComponent = 'atomic-recs-result-template';
export const resultComponent = 'atomic-recs-result';

export const RecsSelectors = {
  shadow: () => cy.get(recsListComponent).shadow(),
  placeholder: () => RecsSelectors.shadow().find(resultPlaceholderComponent),
  result: () => RecsSelectors.shadow().find(resultComponent),
  indicator: () => RecsSelectors.shadow().find('[part~="indicator"]'),
  firstResult: () => RecsSelectors.result().first().shadow(),
  nextButton: () => RecsSelectors.shadow().find('[part="next-button"]'),
  previousButton: () => RecsSelectors.shadow().find('[part="previous-button"]'),
};
