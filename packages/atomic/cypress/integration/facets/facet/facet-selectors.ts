export const facetComponent = 'atomic-facet-v1';
export const FacetSelectors = {
  shadow: () => cy.get(facetComponent).shadow(),
  wrapper: () => FacetSelectors.shadow().find('[part="facet"]'),
  placeholder: () => FacetSelectors.shadow().find('[part="placeholder"]'),
  selectedCheckboxValue: () =>
    FacetSelectors.shadow().find(
      '[part="value-checkbox"][aria-checked="true"]'
    ),
  idleCheckboxValue: () =>
    FacetSelectors.shadow().find(
      '[part="value-checkbox"][aria-checked="false"]'
    ),
  selectedLinkValue: () =>
    FacetSelectors.shadow().find('[part="value-link"][aria-pressed="true"]'),
  idleLinkValue: () =>
    FacetSelectors.shadow().find('[part="value-link"][aria-pressed="false"]'),
  selectedBoxValue: () =>
    FacetSelectors.shadow().find('[part="value-box"][aria-pressed="true"]'),
  idleBoxValue: () =>
    FacetSelectors.shadow().find('[part="value-box"][aria-pressed="false"]'),
  values: () => FacetSelectors.shadow().find('[part="values"]'),
  showMoreButton: () => FacetSelectors.shadow().find('[part="show-more"]'),
  showLessButton: () => FacetSelectors.shadow().find('[part="show-less"]'),
  clearButton: () => FacetSelectors.shadow().find('[part="clear-button"]'),
  labelButton: () => FacetSelectors.shadow().find('[part="label-button"]'),
  searchInput: () => FacetSelectors.shadow().find('[part="search-input"]'),
  searchClearButton: () =>
    FacetSelectors.shadow().find('[part="search-clear-button"]'),
  moreMatches: () => FacetSelectors.shadow().find('[part="more-matches"]'),
  noMatches: () => FacetSelectors.shadow().find('[part="no-matches"]'),
  valueLabel: () => FacetSelectors.shadow().find('[part="value-label"]'),
  valueCount: () => FacetSelectors.shadow().find('[part="value-count"]'),
  valueHighlight: () =>
    FacetSelectors.shadow().find(
      '[part="value-label"] [part="search-highlight"]'
    ),
  facetValueLabelAtIndex: (index: number) =>
    FacetSelectors.valueLabel().eq(index),
};
