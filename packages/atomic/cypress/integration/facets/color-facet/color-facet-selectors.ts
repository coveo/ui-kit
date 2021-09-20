export const colorFacetComponent = 'atomic-color-facet';
export const ColorFacetSelectors = {
  shadow: () => cy.get(colorFacetComponent).shadow(),
  wrapper: () => ColorFacetSelectors.shadow().find('[part="facet"]'),
  placeholder: () => ColorFacetSelectors.shadow().find('[part="placeholder"]'),
  selectedBoxValue: () =>
    ColorFacetSelectors.shadow().find(
      '[part="value-box"][aria-pressed="true"]'
    ),
  idleBoxValue: () =>
    ColorFacetSelectors.shadow().find(
      '[part="value-box"][aria-pressed="false"]'
    ),
  clearButton: () => ColorFacetSelectors.shadow().find('[part="clear-button"]'),
  labelButton: () => ColorFacetSelectors.shadow().find('[part="label-button"]'),
  values: () => ColorFacetSelectors.shadow().find('[part="values"]'),
  valueLabel: () => ColorFacetSelectors.shadow().find('[part="value-label"]'),
  searchInput: () => ColorFacetSelectors.shadow().find('[part="search-input"]'),
  searchClearButton: () =>
    ColorFacetSelectors.shadow().find('[part="search-clear-button"]'),
  moreMatches: () => ColorFacetSelectors.shadow().find('[part="more-matches"]'),
  noMatches: () => ColorFacetSelectors.shadow().find('[part="no-matches"]'),
  valueHighlight: () =>
    ColorFacetSelectors.shadow().find(
      '[part="value-label"] [part="search-highlight"]'
    ),
  facetValueLabelAtIndex: (index: number) =>
    ColorFacetSelectors.valueLabel().eq(index),
  showMoreButton: () => ColorFacetSelectors.shadow().find('[part="show-more"]'),
  showLessButton: () => ColorFacetSelectors.shadow().find('[part="show-less"]'),
};
