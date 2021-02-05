export const PagerSelectors = {
  pager: 'atomic-pager',
  buttonNext: 'button[part="next-button"]',
  buttonPrevious: 'button[part="previous-button"]',
};

export function createAliasLi() {
  cy.get(PagerSelectors.pager).shadow().find('li').as('pagerLi');
}

export function createAliasNavigation() {
  createAliasLi();
  cy.get('@pagerLi').find(PagerSelectors.buttonPrevious).as('previousButton');
  cy.get('@pagerLi').find(PagerSelectors.buttonNext).as('nextButton');
}
