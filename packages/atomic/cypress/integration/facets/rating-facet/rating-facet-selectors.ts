export const ratingFacetComponent = 'atomic-rating-facet';
export const RatingFacetSelectors = {
  shadow: () => cy.get(ratingFacetComponent).shadow(),
  wrapper: () => RatingFacetSelectors.shadow().find('[part="facet"]'),
  placeholder: () => RatingFacetSelectors.shadow().find('[part="placeholder"]'),
  values: () => RatingFacetSelectors.shadow().find('[part="values"]'),
  clearButton: () =>
    RatingFacetSelectors.shadow().find('[part="clear-button"]'),
  labelButton: () =>
    RatingFacetSelectors.shadow().find('[part="label-button"]'),
  valueRating: () =>
    RatingFacetSelectors.shadow().find('[part="value-rating"]'),
  selectedCheckboxValue: () =>
    RatingFacetSelectors.shadow().find(
      '[part="value-checkbox"][aria-checked="true"]'
    ),
  idleCheckboxValue: () =>
    RatingFacetSelectors.shadow().find(
      '[part="value-checkbox"][aria-checked="false"]'
    ),
  checkboxValueWithText: (text: string) =>
    RatingFacetSelectors.shadow()
      .find(`[part="value-rating"][aria-label="${text}"]`)
      .parent()
      .parent()
      .find('[part="value-checkbox"]'),
  idleCheckboxValueLabel: () =>
    RatingFacetSelectors.idleCheckboxValue()
      .parent()
      .find('[part="value-rating"]'),
  selectedLinkValue: () =>
    RatingFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="true"]'
    ),
  idleLinkValue: () =>
    RatingFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="false"]'
    ),
  selectedLinkValueWithText: (text: string) =>
    RatingFacetSelectors.shadow().find(
      `[part="value-link"][aria-pressed="true"] [part="value-rating"][aria-label="${text}"]`
    ),
  idleLinkValueLabel: () =>
    RatingFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="false"] [part="value-rating"]'
    ),
  facetValueAtIndex: (index: number) =>
    RatingFacetSelectors.valueRating().eq(index),
  starsIconAtIndex: (index: number) =>
    RatingFacetSelectors.facetValueAtIndex(index).find('atomic-icon'),
};
