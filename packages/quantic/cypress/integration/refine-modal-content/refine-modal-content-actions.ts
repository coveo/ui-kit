import {
  RefineContentSelector,
  RefineContentSelectors,
} from './refine-modal-content-selectors';

function defineContentActions(selector: RefineContentSelector) {
  return {
    clickClearAllFilters: () => {
      selector
        .clearAllFiltersButton()
        .click()
        .logAction('when clicking "Clear All Filters"');
    },
    clickTimeframeFacetCollapseButton: () => {
      selector
        .timeframeFacetCollapseButton()
        .click()
        .logAction('when clicking expand button of the timeframe facet');
    },
    clickFacetCollapseButton: () => {
      selector
        .facetCollapseButton()
        .click()
        .logAction('when clicking expand button of the default facet');
    },
    clickFacetFirstOption: () => {
      selector
        .facetFirstOption()
        .click()
        .logAction('when clicking first option of the default facet');
    },
    clickTimeframeFacetFirstOption: () => {
      selector
        .timeframeFacetFirstOption()
        .click()
        .logAction('when clicking first option of the timeframe facet');
    },
  };
}

export const RefineContentActions = {
  ...defineContentActions(RefineContentSelectors),
};
