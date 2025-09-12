export const numericFacetComponent = 'atomic-numeric-facet';
export const NumericFacetSelectors = {
  withId(id: string) {
    return {
      ...this,
      shadow() {
        return cy.get(`${numericFacetComponent}[facet-id="${id}"]`).shadow();
      },
    };
  },
  shadow () { return cy.get(numericFacetComponent).shadow()},
  wrapper() {
    return this.shadow().find('[part="facet"]');
  },
  placeholder() {
    return this.shadow().find('[part="placeholder"]');
  },
  selectedCheckboxValue() {
    return this.shadow().find(
      '[part~="value-checkbox"][part~="value-checkbox-checked"][aria-checked="true"]'
    );
  },
  idleCheckboxValue() {
    return this.shadow().find(
      '[part~="value-checkbox"]:not([part~="value-checkbox-checked"])[aria-checked="false"]'
    );
  },
  checkboxValueWithText(text: string) {
    return this.shadow()
      .find(`[part="value-label"]:contains("${text}")`)
      .parent()
      .parent()
      .find('[part~="value-checkbox"]');
  },
  idleCheckboxValueLabel() {
    return this.idleCheckboxValue().parent().find('[part="value-label"]');
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
    return this.shadow().find(
      `[part~="value-link"][part~="value-link-selected"][aria-pressed="true"] [part="value-label"]:contains("${text}")`
    );
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
  values() {
    return this.shadow().find('[part="values"]');
  },
  clearButton() {
    return this.shadow().find('[part="clear-button"]');
  },
  labelButton() {
    return this.shadow().find('[part="label-button"]');
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
  rangeInput() {
    return this.shadow().find('atomic-facet-number-input form');
  },
  minInput() {
    return this.shadow().find('[part="input-start"]');
  },
  maxInput() {
    return this.shadow().find('[part="input-end"]');
  },
  applyButton() {
    return this.rangeInput().find('[part="input-apply-button"]');
  },
  inputInvalid() {
    return this.rangeInput().find('input:invalid');
  },
};
