export const timeframeFacetComponent = 'atomic-timeframe-facet';
export const TimeframeFacetSelectors = {
  withId(id: string) {
    return {
      ...this,
      shadow() {
        return cy.get(`${timeframeFacetComponent}[facet-id="${id}"]`).shadow();
      },
    };
  },
  shadow() {
    return cy.get(timeframeFacetComponent).shadow();
  },
  wrapper() {
    return this.shadow().find('[part="facet"]');
  },
  placeholder() {
    return this.shadow().find('[part="placeholder"]');
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
  facetValueLabelAtIndex(index: number) {
    return this.valueLabel().eq(index);
  },
  rangeInput() {
    return this.shadow().find('atomic-stencil-facet-date-input form');
  },
  startDate() {
    return this.shadow().find('[part="input-start"]');
  },
  endDate() {
    return this.shadow().find('[part="input-end"]');
  },
  applyButton() {
    return this.rangeInput().find('[part="input-apply-button"]');
  },
  inputInvalid() {
    return this.rangeInput().find('input:invalid');
  },
};
