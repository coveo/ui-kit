export const pagerComponent = 'atomic-pager';

export const PagerSelectors = {
  pager: () => cy.get(pagerComponent),
  shadow: () => PagerSelectors.pager().shadow(),
  li: () => PagerSelectors.shadow().find('li'),
  buttonNext: () => PagerSelectors.shadow().find('[part="next-button"]'),
  buttonPrevious: () =>
    PagerSelectors.shadow().find('[part="previous-button"]'),
  buttonActivePage: () => PagerSelectors.shadow().find('[aria-current="page"]'),
};
