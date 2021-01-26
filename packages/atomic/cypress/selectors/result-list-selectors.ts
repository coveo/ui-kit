export const ResultListSelectors = {
  component: 'atomic-result-list',
};

export function generateAliasForResultList() {
  cy.get(ResultListSelectors.component).as('resultList');
}
