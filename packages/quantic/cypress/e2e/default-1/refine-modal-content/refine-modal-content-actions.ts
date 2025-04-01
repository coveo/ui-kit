import {
  RefineContentSelector,
  RefineContentSelectors,
} from './refine-modal-content-selectors';

function refineContentActions(selector: RefineContentSelector) {
  return {
    clickClearAllFilters: () => {
      selector
        .clearAllFiltersButton()
        .click()
        .logAction('when clicking "Clear All Filters"');
    },
    clickDuplicatedTimeframeFacetExpandButton: () => {
      selector
        .timeframeFacetExpandButton()
        .click()
        .logAction(
          'when clicking the expand button of the duplicated timeframe facet'
        );
    },
    clickDuplicatedFacetExpandButton: () => {
      selector
        .facetExpandButton()
        .click()
        .logAction(
          'when clicking the expand button of the duplicated default facet'
        );
    },
    clickDuplicatedFacetFirstOption: () => {
      selector
        .facetFirstOption()
        .click()
        .logAction(
          'when clicking the first option of the duplicated default facet'
        );
    },
    clickDuplicatedTimeframeFacetFirstOption: () => {
      selector
        .timeframeFacetFirstOption()
        .click()
        .logAction(
          'when clicking the first option of the duplicated timeframe facet'
        );
    },
    openRefineModalSortDropdown: () => {
      selector
        .refineSortDropdown()
        .click()
        .logAction('when opening the sort dropdown in the refine modal');
    },
  };
}

function sortActions(selector: RefineContentSelector) {
  return {
    openSortDropdown: () => {
      selector
        .sortDropdown()
        .click()
        .logAction('when opening the sort dropdown');
    },
  };
}

export const RefineContentActions = {
  ...refineContentActions(RefineContentSelectors),
  ...sortActions(RefineContentSelectors),
};
