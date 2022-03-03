export const ratingFacetComponent = 'atomic-rating-facet';
export const RatingFacetSelectors = {
  withId(id: string) {
    return {
      ...this,
      shadow() {
        return cy.get(`${ratingFacetComponent}[facet-id="${id}"]`).shadow();
      },
    };
  },
  shadow() {
    return cy.get(ratingFacetComponent).shadow();
  },
  wrapper() {
    return this.shadow().find('[part="facet"]');
  },
  placeholder() {
    return this.shadow().find('[part="placeholder"]');
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
  valueRating() {
    return this.shadow().find('[part="value-rating"]');
  },
  selectedCheckboxValue() {
    return this.shadow().find('[part="value-checkbox"][aria-checked="true"]');
  },
  idleCheckboxValue() {
    return this.shadow().find('[part="value-checkbox"][aria-checked="false"]');
  },
  checkboxValueWithText(text: string) {
    return this.shadow()
      .find(`[part="value-rating"][aria-label="${text}"]`)
      .parent()
      .parent()
      .find('[part="value-checkbox"]');
  },
  idleCheckboxValueLabel() {
    return this.idleCheckboxValue().parent().find('[part="value-rating"]');
  },
  selectedLinkValue() {
    return this.shadow().find('[part="value-link"][aria-pressed="true"]');
  },
  idleLinkValue() {
    return this.shadow().find('[part="value-link"][aria-pressed="false"]');
  },
  selectedLinkValueWithText(text: string) {
    return this.shadow().find(
      `[part="value-link"][aria-pressed="true"] [part="value-rating"][aria-label="${text}"]`
    );
  },
  idleLinkValueLabel() {
    return this.shadow().find(
      '[part="value-link"][aria-pressed="false"] [part="value-rating"]'
    );
  },
  facetValueAtIndex(index: number) {
    return this.valueRating().eq(index);
  },
  starsIconAtIndex(index: number) {
    return this.facetValueAtIndex(index).find('atomic-icon');
  },
};
