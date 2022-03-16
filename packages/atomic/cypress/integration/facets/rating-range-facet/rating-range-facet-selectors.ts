export const ratingRangeFacetComponent = 'atomic-rating-range-facet';
export const RatingRangeFacetSelectors = {
  withId(id: string) {
    return {
      ...this,
      shadow() {
        return cy
          .get(`${ratingRangeFacetComponent}[facet-id="${id}"]`)
          .shadow();
      },
    };
  },
  shadow() {
    return cy.get(ratingRangeFacetComponent).shadow();
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
  valueRating() {
    return this.shadow().find('[part="value-rating"]');
  },
  valueLabel() {
    return this.shadow().find('[part="value-label"]');
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
  facetValueLabelAtIndex(index: number) {
    return this.valueLabel().eq(index);
  },
  starsIconAtIndex(index: number) {
    return this.facetValueAtIndex(index).find('atomic-icon');
  },
};
