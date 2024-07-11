import {
  RefineContentSelector,
  RefineContentSelectors,
  SortSelector,
  SortSelectors,
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
      selector.refineCombobox().click();
    },
  };
}

function sortActions(selector: SortSelector) {
  return {
    openSortDropdown: () => {
      selector.combobox().click();
    },
  };
}

export const RefineContentActions = {
  ...refineContentActions(RefineContentSelectors),
  ...sortActions(SortSelectors),
};
