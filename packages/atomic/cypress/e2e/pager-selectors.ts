export const pagerComponent = 'atomic-pager';

export const PagerSelectors = {
  pager: () => cy.get(pagerComponent),
  shadow: () => PagerSelectors.pager().shadow(),
  pageButtons: () =>
    PagerSelectors.shadow().find('[part="page-buttons"]').children(),
  pageButton: (pageNumber: string | number) =>
    PagerSelectors.pageButtons().filter(`[value="${pageNumber}"]`),
  buttonNext: () => PagerSelectors.shadow().find('[part="next-button"]'),
  buttonPrevious: () =>
    PagerSelectors.shadow().find('[part="previous-button"]'),
  buttonActivePage: () => PagerSelectors.shadow().find('[aria-current="page"]'),
  buttonIconNext: () =>
    PagerSelectors.shadow().find('[part="next-button-icon"]'),
  buttonIconPrevious: () =>
    PagerSelectors.shadow().find('[part="next-button-icon"]'),
};
