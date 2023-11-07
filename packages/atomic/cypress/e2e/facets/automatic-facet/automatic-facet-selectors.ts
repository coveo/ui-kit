export const automaticFacetComponent = 'atomic-automatic-facet';

export const AutomaticFacetSelectors = {
  shadow() {
    return cy.get(automaticFacetComponent).shadow();
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
      .find('[part="value-label"]')
      .contains(text)
      .parent()
      .parent()
      .find('[part~="value-checkbox"]');
  },
  idleCheckboxValueLabel() {
    return this.idleCheckboxValue().parent().find('[part="value-label"]');
  },
  wrapper() {
    return this.shadow().find('[part="facet"]');
  },
  labelButton() {
    return this.shadow().find('[part="label-button"]');
  },
  labelButtonIcon() {
    return this.shadow().find('[part="label-button-icon"]', {timeout: 8000});
  },
  clearButton() {
    return this.shadow().find('[part="clear-button"]');
  },
  clearButtonIcon() {
    return this.shadow().find('[part="clear-button-icon"]', {timeout: 8000});
  },
  values() {
    return this.shadow().find('[part="values"]');
  },
  valueLabel() {
    return this.shadow().find('[part="value-label"]');
  },
  valueCount() {
    return this.shadow().find('[part="value-count"]');
  },
  valueCheckbox() {
    return this.shadow().find('[part="value-checkbox"]');
  },
  valueCheckboxChecked() {
    return this.shadow().find('[part="value-checkbox-checked"]');
  },
  valueCheckboxLabel() {
    return this.shadow().find('[part="value-checkbox-label"]');
  },
  valueCheckboxIcon() {
    return this.shadow().find('[part="value-checkbox-icon"]', {timeout: 8000});
  },
  facetValueLabelAtIndex(index: number) {
    return this.valueLabel().eq(index);
  },
};
