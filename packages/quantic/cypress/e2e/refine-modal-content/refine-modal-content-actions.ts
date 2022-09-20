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
  };
}

export const RefineContentActions = {
  ...defineContentActions(RefineContentSelectors),
};
