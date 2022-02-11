export const ariaLiveComponent = 'atomic-aria-live';

export const AriaLiveSelectors = {
  element: () => cy.get('atomic-search-interface').find(ariaLiveComponent),
};
