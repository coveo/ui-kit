import {
  TimeframeFacetSelector,
  TimeframeFacetSelectors,
} from './timeframe-facet-selectors';

function timeframeFacetActions(selector: TimeframeFacetSelector) {
  return {
    selectValue: (value: string) =>
      selector
        .valueLabel()
        .contains(value)
        .click()
        .logAction(`when selecting "${value}" in the time frame facet`),

    clearFilter: () => selector.clearFilterButton().click(),

    collapse: () => selector.collapseButton().click(),
    expand: () => selector.expandButton().click(),

    typeStartDate: (dateString: string) =>
      selector.startInput().clear().type(dateString),
    typeEndDate: (dateString: string) =>
      selector.endInput().clear().type(dateString),

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
