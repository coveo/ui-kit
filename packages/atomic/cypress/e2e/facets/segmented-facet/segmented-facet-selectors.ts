export const segmentedFacetComponent = 'atomic-segmented-facet';
export const SegmentedFacetSelectors = {
  withId(id: string) {
    return {
      ...this,
      shadow() {
        return cy.get(`${segmentedFacetComponent}[facet-id="${id}"]`).shadow();
      },
    };
  },
  shadow() {
    return cy.get(segmentedFacetComponent).shadow();
  },
  wrapper() {
    return this.shadow().find('[part="segmented-container"]');
  },
  placeholder() {
    return this.shadow().find('[part="placeholder"]');
  },
  checkboxValueWithText(text: string) {
    return this.shadow()
      .find(`[part="value-label"]:contains("${text}")`)
      .parent()
      .parent()
      .find('[part~="value-box"]');
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
  labelButton() {
    return this.shadow().find('[part="label"]');
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
  facetValueLabelAtIndex(index: number) {
    return this.valueLabel().eq(index);
  },
};
