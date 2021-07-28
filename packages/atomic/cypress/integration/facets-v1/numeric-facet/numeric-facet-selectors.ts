export const numericFacetComponent = 'atomic-numeric-facet-v1';
export const NumericFacetSelectors = {
  shadow: () => cy.get(numericFacetComponent).shadow(),
  wrapper: () => NumericFacetSelectors.shadow().find('[part="facet"]'),
  placeholder: () =>
    NumericFacetSelectors.shadow().find('[part="placeholder"]'),
  selectedCheckboxValue: () =>
    NumericFacetSelectors.shadow().find(
      '[part="value-checkbox"][aria-checked="true"]'
    ),
  idleCheckboxValue: () =>
    NumericFacetSelectors.shadow().find(
      '[part="value-checkbox"][aria-checked="false"]'
    ),
  selectedLinkValue: () =>
    NumericFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="true"]'
    ),
  idleLinkValue: () =>
    NumericFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="false"]'
    ),
  selectedBoxValue: () =>
    NumericFacetSelectors.shadow().find(
      '[part="value-box"][aria-pressed="true"]'
    ),
  idleBoxValue: () =>
    NumericFacetSelectors.shadow().find(
      '[part="value-box"][aria-pressed="false"]'
    ),
  values: () => NumericFacetSelectors.shadow().find('[part="values"]'),
  clearButton: () =>
    NumericFacetSelectors.shadow().find('[part="clear-button"]'),
  labelButton: () =>
    NumericFacetSelectors.shadow().find('[part="label-button"]'),
  valueLabel: () => NumericFacetSelectors.shadow().find('[part="value-label"]'),
  valueCount: () => NumericFacetSelectors.shadow().find('[part="value-count"]'),
  valueHighlight: () =>
    NumericFacetSelectors.shadow().find(
      '[part="value-label"] [part="search-highlight"]'
    ),
  facetValueLabelAtIndex: (index: number) =>
    NumericFacetSelectors.valueLabel().eq(index),
  rangeInput: () =>
    NumericFacetSelectors.shadow().find('atomic-facet-number-input form'),
  minInput: () => NumericFacetSelectors.shadow().find('[part="input-start"]'),
  maxInput: () => NumericFacetSelectors.shadow().find('[part="input-end"]'),
  applyButton: () =>
    NumericFacetSelectors.rangeInput().find('[part="input-apply-button"]'),
  inputInvalid: () => NumericFacetSelectors.rangeInput().find('input:invalid'),
};
