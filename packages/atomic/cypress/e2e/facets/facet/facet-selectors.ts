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
  selectedCheckboxValue(exclusionEnabled = false) {
    return this.shadow().find(
      `[part~="value-checkbox"][part~="value-checkbox-checked"][aria-${
        exclusionEnabled ? 'pressed' : 'checked'
      }="true"]`
    );
  },
  idleCheckboxValue(exclusionEnabled = false) {
    return this.shadow().find(
      `[part~="value-checkbox"]:not([part~="value-checkbox-checked"])[aria-${
        exclusionEnabled ? 'pressed' : 'checked'
      }="false"]`
    );
  },
  excludedCheckboxValue() {
    return this.shadow().find(
      '[part~="value-checkbox"][part~="value-checkbox-checked"][aria-pressed="mixed"]'
    );
  },
  checkboxValueWithText(text: string) {
    return this.shadow()
      .find('[part="value-label"]')
      .contains(text)
      .parent()
      .parent()
      .find('[part~="value-checkbox"]');
  },
  idleCheckboxValueLabel(exclusionEnabled = false) {
    return this.idleCheckboxValue(exclusionEnabled)
      .parent()
      .find('[part="value-label"]');
  },
  excludeButton() {
    return this.idleCheckboxValue(true)
      .parent()
      .find('[part="value-exclude-button"]');
  },
  selectedLinkValue() {
    return this.shadow().find(
      '[part~="value-link"][part~="value-link-selected"][aria-pressed="true"]'
    );
  },
  idleLinkValue() {
    return this.shadow().find(
      '[part~="value-link"]:not([part~="value-link-selected"])[aria-pressed="false"]'
    );
  },
  selectedLinkValueWithText(text: string) {
    return this.shadow()
      .find(
        '[part~="value-link"][part~="value-link-selected"][aria-pressed="true"] [part="value-label"]'
      )
      .contains(text);
  },
  idleLinkValueLabel() {
    return this.shadow().find(
      '[part~="value-link"]:not([part~="value-link-selected"])[aria-pressed="false"] [part="value-label"]'
    );
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
    return this.shadow()
      .find(
        '[part~="value-box"][part~="value-box-selected"][aria-pressed="true"]'
      )
      .contains(text);
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
