export const facetComponent = 'atomic-facet';
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
  checkboxValueWithText: (text: string) =>
    FacetSelectors.shadow()
      .find(`[part="value-label"]:contains("${text}")`)
      .parent()
      .parent()
      .find('[part="value-checkbox"]'),
  idleCheckboxValueLabel: () =>
    FacetSelectors.idleCheckboxValue().parent().find('[part="value-label"]'),
  selectedLinkValue: () =>
    FacetSelectors.shadow().find('[part="value-link"][aria-pressed="true"]'),
  idleLinkValue: () =>
    FacetSelectors.shadow().find('[part="value-link"][aria-pressed="false"]'),
  selectedLinkValueWithText: (text: string) =>
    FacetSelectors.shadow().find(
      `[part="value-link"][aria-pressed="true"] [part="value-label"]:contains("${text}")`
    ),
  idleLinkValueLabel: () =>
    FacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="false"] [part="value-label"]'
    ),
  selectedBoxValue: () =>
    FacetSelectors.shadow().find('[part="value-box"][aria-pressed="true"]'),
  idleBoxValue: () =>
    FacetSelectors.shadow().find('[part="value-box"][aria-pressed="false"]'),
  selectedBoxValueWithText: (text: string) =>
    FacetSelectors.shadow().find(
      `[part="value-box"][aria-pressed="true"]:contains("${text}")`
    ),
  idleBoxValueLabel: () =>
    FacetSelectors.idleBoxValue().find('[part="value-label"]'),
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
