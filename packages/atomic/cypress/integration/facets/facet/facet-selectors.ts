export const facetComponent = 'atomic-facet';
export const FacetSelectors = {
  withId(id: string) {
    return {
      ...this,
      shadow() {
        return cy.get(`${facetComponent}[facet-id="${id}"]`).shadow();
      },
    };
  },
  shadow() {
    return cy.get(facetComponent).shadow();
  },
  wrapper() {
    return this.shadow().find('[part="facet"]');
  },
  placeholder() {
    return this.shadow().find('[part="placeholder"]');
  },
  selectedCheckboxValue() {
    return this.shadow().find('[part="value-checkbox"][aria-checked="true"]');
  },
  idleCheckboxValue() {
    return this.shadow().find('[part="value-checkbox"][aria-checked="false"]');
  },
  checkboxValueWithText(text: string) {
    return this.shadow()
      .find(`[part="value-label"]:contains("${text}")`)
      .parent()
      .parent()
      .find('[part="value-checkbox"]');
  },
  idleCheckboxValueLabel() {
    return this.idleCheckboxValue().parent().find('[part="value-label"]');
  },
  selectedLinkValue() {
    return this.shadow().find('[part="value-link"][aria-pressed="true"]');
  },
  idleLinkValue() {
    return this.shadow().find('[part="value-link"][aria-pressed="false"]');
  },
  selectedLinkValueWithText(text: string) {
    return this.shadow().find(
      `[part="value-link"][aria-pressed="true"] [part="value-label"]:contains("${text}")`
    );
  },
  idleLinkValueLabel() {
    return this.shadow().find(
      '[part="value-link"][aria-pressed="false"] [part="value-label"]'
    );
  },
  selectedBoxValue() {
    return this.shadow().find('[part="value-box"][aria-pressed="true"]');
  },
  idleBoxValue() {
    return this.shadow().find('[part="value-box"][aria-pressed="false"]');
  },
  selectedBoxValueWithText(text: string) {
    return this.shadow().find(
      `[part="value-box"][aria-pressed="true"]:contains("${text}")`
    );
  },
  idleBoxValueLabel() {
    return this.idleBoxValue().find('[part="value-label"]');
  },
  values() {
    return this.shadow().find('[part="values"]');
  },
  showMoreButton() {
    return this.shadow().find('[part="show-more"]');
  },
  showLessButton() {
    return this.shadow().find('[part="show-less"]');
  },
  clearButton() {
    return this.shadow().find('[part="clear-button"]');
  },
  labelButton() {
    return this.shadow().find('[part="label-button"]');
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
  valueLabel() {
    return this.shadow().find('[part="value-label"]');
  },
  valueCount() {
    return this.shadow().find('[part="value-count"]');
  },
  valueHighlight() {
    return this.shadow().find('[part="value-label"] [part="search-highlight"]');
  },
  facetValueLabelAtIndex(index: number) {
    return this.valueLabel().eq(index);
  },
};
