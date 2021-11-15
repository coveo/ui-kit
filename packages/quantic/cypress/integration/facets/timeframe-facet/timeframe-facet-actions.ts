import {
  TimeframeFacetSelector,
  TimeframeFacetSelectors,
} from './timeframe-facet-selectors';

function timeframeFacetActions(selector: TimeframeFacetSelector) {
  return {
    selectValue: (value: string) =>
      selector.valueLabel().contains(value).click(),

    clearFilter: () => selector.clearFilterButton().click(),

    collapse: () => selector.collapseButton().click(),
    expand: () => selector.expandButton().click(),

    applyRange: (start: string, end: string) => {
      selector.startInput().clear().type(start);
      selector.endInput().clear().type(end);
      selector.form().submit();
    },

    submitForm: () => selector.form().submit(),
  };
}

export const TimeframeFacetActions = {
  ...timeframeFacetActions(TimeframeFacetSelectors),
};
