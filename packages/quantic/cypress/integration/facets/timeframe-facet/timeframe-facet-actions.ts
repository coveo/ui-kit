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
  };
}

export const TimeframeFacetActions = {
  ...timeframeFacetActions(TimeframeFacetSelectors),
};
