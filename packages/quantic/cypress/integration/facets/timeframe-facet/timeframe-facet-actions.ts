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
      selector.startInput().type(start);
      selector.endInput().type(end);
      selector.applyButton().click();
    },
  };
}

export const TimeframeFacetActions = {
  ...timeframeFacetActions(TimeframeFacetSelectors),
};
