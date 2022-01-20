export const ratingRangeFacetComponent = 'atomic-rating-range-facet';
export const RatingRangeFacetSelectors = {
  shadow: () => cy.get(ratingRangeFacetComponent).shadow(),
  wrapper: () => RatingRangeFacetSelectors.shadow().find('[part="facet"]'),
  placeholder: () =>
    RatingRangeFacetSelectors.shadow().find('[part="placeholder"]'),
  values: () => RatingRangeFacetSelectors.shadow().find('[part="values"]'),
  clearButton: () =>
    RatingRangeFacetSelectors.shadow().find('[part="clear-button"]'),
  labelButton: () =>
    RatingRangeFacetSelectors.shadow().find('[part="label-button"]'),
  valueRating: () =>
    RatingRangeFacetSelectors.shadow().find('[part="value-rating"]'),
  valueLabel: () =>
    RatingRangeFacetSelectors.shadow().find('[part="value-label"]'),
  selectedLinkValue: () =>
    RatingRangeFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="true"]'
    ),
  idleLinkValue: () =>
    RatingRangeFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="false"]'
    ),
  selectedLinkValueWithText: (text: string) =>
    RatingRangeFacetSelectors.shadow().find(
      `[part="value-link"][aria-pressed="true"] [part="value-rating"][aria-label="${text}"]`
    ),
  idleLinkValueLabel: () =>
    RatingRangeFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="false"] [part="value-rating"]'
    ),
  facetValueAtIndex: (index: number) =>
    RatingRangeFacetSelectors.valueRating().eq(index),
  facetValueLabelAtIndex: (index: number) =>
    RatingRangeFacetSelectors.valueLabel().eq(index),
  starsIconAtIndex: (index: number) =>
    RatingRangeFacetSelectors.facetValueAtIndex(index).find('atomic-icon'),
};
