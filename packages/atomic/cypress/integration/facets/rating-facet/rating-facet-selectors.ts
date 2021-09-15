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
  valueLabel: () => RatingFacetSelectors.shadow().find('[part="value-rating"]'),
  selectedCheckboxValue: () =>
    RatingFacetSelectors.shadow().find(
      '[part="value-checkbox"][aria-checked="true"]'
    ),
  idleCheckboxValue: () =>
    RatingFacetSelectors.shadow().find(
      '[part="value-checkbox"][aria-checked="false"]'
    ),
  selectedLinkValue: () =>
    RatingFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="true"]'
    ),
  idleLinkValue: () =>
    RatingFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="false"]'
    ),
  facetValueAtIndex: (index: number) =>
    RatingFacetSelectors.valueLabel().eq(index),
  starsIconAtIndex: (index: number) =>
    RatingFacetSelectors.facetValueAtIndex(index).find('atomic-icon'),
};
