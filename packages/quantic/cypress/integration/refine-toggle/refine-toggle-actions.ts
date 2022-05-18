import {
  RefineToggleSelector,
  RefineToggleSelectors,
} from './refine-toggle-selectors';

const refineToggleActions = (selector: RefineToggleSelector) => {
  return {
    clickRefineButton: () =>
      selector
        .refineToggle()
        .click({force: true})
        .logAction('When clicking the refine button'),

    clickRefineModalCloseButton: () =>
      selector
        .refineModalCloseButton()
        .click()
        .logAction('When clicking the refine modal close button'),

    clickViewResultsButton: () =>
      selector
        .viewResultsButton()
        .click()
        .logAction('When clicking the view results button'),

    clickTimeframeFacetExpandButton: () => {
      selector
        .timeframeFacetExpandButton()
        .click()
        .logAction(
          'when clicking the expand button of the duplicated timeframe facet'
        );
    },
    clickFacetExpandButton: () => {
      selector
        .facetExpandButton()
        .click()
        .logAction(
          'when clicking the expand button of the duplicated default facet'
        );
    },
    clickFacetFirstOption: () => {
      selector
        .facetFirstOption()
        .click()
        .logAction(
          'when clicking the first option of the duplicated default facet'
        );
    },
    clickTimeframeFacetFirstOption: () => {
      selector
        .timeframeFacetFirstOption()
        .click()
        .logAction(
          'when clicking the first option of the duplicated timeframe facet'
        );
    },
    clickClearAllFilters: () => {
      selector
        .clearAllFiltersButton()
        .click()
        .logAction('when clicking "Clear All Filters"');
    },
    clickFacetClearFilters: () => {
      selector
        .facetClearFiltersButton()
        .click()
        .logAction('when clicking facet clear filters');
    },
  };
};

export const RefineToggleActions = {
  ...refineToggleActions(RefineToggleSelectors),
};
