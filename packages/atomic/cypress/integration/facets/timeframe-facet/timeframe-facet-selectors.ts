export const timeframeFacetComponent = 'atomic-timeframe-facet';
export const TimeframeFacetSelectors = {
  shadow: () => cy.get(timeframeFacetComponent).shadow(),
  wrapper: () => TimeframeFacetSelectors.shadow().find('[part="facet"]'),
  placeholder: () =>
    TimeframeFacetSelectors.shadow().find('[part="placeholder"]'),
  selectedLinkValue: () =>
    TimeframeFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="true"]'
    ),
  idleLinkValue: () =>
    TimeframeFacetSelectors.shadow().find(
      '[part="value-link"][aria-pressed="false"]'
    ),
  values: () => TimeframeFacetSelectors.shadow().find('[part="values"]'),
  clearButton: () =>
    TimeframeFacetSelectors.shadow().find('[part="clear-button"]'),
  labelButton: () =>
    TimeframeFacetSelectors.shadow().find('[part="label-button"]'),
  valueLabel: () =>
    TimeframeFacetSelectors.shadow().find('[part="value-label"]'),
  valueCount: () =>
    TimeframeFacetSelectors.shadow().find('[part="value-count"]'),
  facetValueLabelAtIndex: (index: number) =>
    TimeframeFacetSelectors.valueLabel().eq(index),
  rangeInput: () =>
    TimeframeFacetSelectors.shadow().find('atomic-facet-date-input form'),
  startDate: () =>
    TimeframeFacetSelectors.shadow().find('[part="input-start"]'),
  endDate: () => TimeframeFacetSelectors.shadow().find('[part="input-end"]'),
  applyButton: () =>
    TimeframeFacetSelectors.rangeInput().find('[part="input-apply-button"]'),
  inputInvalid: () =>
    TimeframeFacetSelectors.rangeInput().find('input:invalid'),
};
