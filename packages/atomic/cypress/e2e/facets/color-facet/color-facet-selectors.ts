export const colorFacetComponent = 'atomic-color-facet';
export const ColorFacetSelectors = {
  withId(id: string) {
    return {
      ...this,
      shadow() {
        return cy.get(`${colorFacetComponent}[facet-id="${id}"]`).shadow();
      },
    };
  },
  shadow() {
    return cy.get(colorFacetComponent).shadow();
  },
  wrapper() {
    return this.shadow().find('[part="facet"]');
  },
  placeholder() {
    return this.shadow().find('[part="placeholder"]');
  },
  selectedBoxValue() {
    return this.shadow().find(
      '[part~="value-box"][part~="value-box-selected"][aria-pressed="true"]'
    );
  },
  idleBoxValue() {
    return this.shadow().find(
      '[part~="value-box"]:not([part~="value-box-selected"])[aria-pressed="false"]'
    );
  },
  selectedBoxValueWithText(text: string) {
    return this.shadow().find(
      `[part~="value-box"][part~="value-box-selected"][aria-pressed="true"]:contains("${text}")`
    );
  },
  boxValueWithText(text: string) {
    return this.shadow().find(`[part~="value-box"]:contains("${text}")`);
  },
  idleBoxValueLabel() {
    return this.idleBoxValue().find('[part="value-label"]');
  },
  clearButton() {
    return this.shadow().find('[part="clear-button"]');
  },
  labelButton() {
    return this.shadow().find('[part="label-button"]');
  },
  values() {
    return this.shadow().find('[part="values"]');
  },
  valueLabel() {
    return this.shadow().find('[part="value-label"]');
  },
  searchInput() {
    return this.shadow().find('[part="search-input"]');
  },
  searchClearButton() {
    return this.shadow().find('[part="search-clear-button"]');
  },
  moreMatches() {
    return this.shadow().find('[part="more-matches"]');
  },
  noMatches() {
    return this.shadow().find('[part="no-matches"]');
  },
  valueHighlight() {
    return this.shadow().find('[part="value-label"] [part="search-highlight"]');
  },
  facetValueLabelAtIndex(index: number) {
    return this.valueLabel().eq(index);
  },
  showMoreButton() {
    return this.shadow().find('[part="show-more"]');
  },
  showLessButton() {
    return this.shadow().find('[part="show-less"]');
  },
};
