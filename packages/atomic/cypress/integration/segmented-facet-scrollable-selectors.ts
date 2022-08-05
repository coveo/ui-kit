export const scrollableComponent = 'atomic-segmented-facet-scrollable';
export const ScrollableSelectors = {
  shadow: () => cy.get(scrollableComponent).shadow(),
  wrapper: () =>
    ScrollableSelectors.shadow().find('[part="scrollable-container"]'),
  leftArrow: () =>
    ScrollableSelectors.shadow().find('[part="left-arrow-button"]'),
  rightArrow: () =>
    ScrollableSelectors.shadow().find('[part="right-arrow-button"]'),
  horizontalScroll: () =>
    ScrollableSelectors.shadow().find('[part="horizontal-scroll"]'),
};
