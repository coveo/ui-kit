import {configure} from '../../../page-objects/configurator';
import {InterceptAliases, interceptSearch} from '../../../page-objects/search';
import {scope} from '../../../reporters/detailed-collector';
import {RefineContentActions as Actions} from './refine-modal-content-actions';
import {RefineContentExpectations as Expect} from './refine-modal-content-expectations';

interface RefineContentOptions {
  hideSort: boolean;
  disableDynamicNavigation: boolean;
}

const customSortOptions = [
  {
    label: 'Views Descending',
    value: '@ytviewcount descending',
    criterion: {
      by: 'field',
      field: 'ytviewcount',
      order: 'descending',
    },
  },
  {
    label: 'NO SORT',
    value: 'nosort',
    criterion: {
      by: 'nosort',
    },
  },
];

const defaultCustomSort = {
  label: 'Date ascending',
  value: 'date ascending',
  criterion: {
    by: 'date',
    order: 'ascending',
  },
};
const customSortOptionsValues = [defaultCustomSort, ...customSortOptions].map(
  (option) => option.value
);

describe('quantic-refine-content', () => {
  const pageUrl = 's/quantic-refine-modal-content';

  function visitRefineContent(
    options: Partial<RefineContentOptions> = {},
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  describe('when using default options', () => {
    it('should render the duplicated facets and the sort component', () => {
      visitRefineContent();

      scope('when loading the page', () => {
        Expect.displayFiltersTitle(true);
        Expect.displayClearAllFiltersButton(false);
        Expect.displayFacetManager();
        Expect.displayDuplicatedNumericFacet();
        Expect.displayDuplicatedFacet();
        Expect.displayDuplicatedCategoryFacet();
        Expect.displayDuplicatedTimeframeFacet();
        Expect.displayDuplicatedDateFacet();
        Expect.displayRefineModalSort(true);
        Expect.correctFacetsOrder();
      });

      scope('when selecting values from the duplicated facets', () => {
        Actions.clickDuplicatedTimeframeFacetExpandButton();
        Expect.displayDuplicatedTimeframeFacetValues();
        Actions.clickDuplicatedTimeframeFacetFirstOption();
        Expect.displayClearAllFiltersButton(true);
        Expect.displayDuplicatedTimeframeFacetClearFiltersButton(true);
        Expect.displayTimeframeFacetClearFiltersButton(true);
        Actions.clickDuplicatedFacetExpandButton();
        Actions.clickDuplicatedFacetFirstOption();
        Expect.displayClearAllFiltersButton(true);
        Expect.displayDuplicatedFacetClearFiltersButton(true);
        Expect.displayFacetClearFiltersButton(true);
        Expect.correctFacetsOrder();
      });

      scope('when clearing all filters', () => {
        Actions.clickClearAllFilters();
        Expect.displayClearAllFiltersButton(false);
        Expect.displayDuplicatedTimeframeFacetClearFiltersButton(false);
        Expect.displayTimeframeFacetClearFiltersButton(false);
        Expect.displayDuplicatedFacetClearFiltersButton(false);
        Expect.displayFacetClearFiltersButton(false);
        Expect.correctFacetsOrder();
      });
    });
  });

  describe('when hideSort property is set to true', () => {
    it('should render only the duplicated facets', () => {
      visitRefineContent({
        hideSort: true,
      });

      scope('when loading the page', () => {
        Expect.displayFiltersTitle(false);
        Expect.displayClearAllFiltersButton(false);
        Expect.displayFacetManager();
        Expect.displayDuplicatedNumericFacet();
        Expect.displayDuplicatedFacet();
        Expect.displayDuplicatedCategoryFacet();
        Expect.displayDuplicatedTimeframeFacet();
        Actions.clickDuplicatedTimeframeFacetExpandButton();
        Expect.displayDuplicatedTimeframeFacetValues();
        Expect.displayDuplicatedDateFacet();
        Expect.displayRefineModalSort(false);
        Expect.correctFacetsOrder();
      });
    });
  });

  describe('when disableDynamicNavigation property is set to true', () => {
    it('should not render the facets inside the quantic-facets-manager', () => {
      visitRefineContent({
        disableDynamicNavigation: true,
      });

      scope('when loading the page', () => {
        Expect.displayFiltersTitle(true);
        Expect.displayClearAllFiltersButton(false);
        Expect.displayFacetManager(false);
        Expect.displayDuplicatedNumericFacet();
        Expect.displayDuplicatedFacet();
        Expect.displayDuplicatedCategoryFacet();
        Expect.displayDuplicatedTimeframeFacet();
        Actions.clickDuplicatedTimeframeFacetExpandButton();
        Expect.displayDuplicatedTimeframeFacetValues();
        Expect.displayDuplicatedDateFacet();
        Expect.displayRefineModalSort(true);
      });
    });
  });

  describe('when using custom sort options', () => {
    it('should render the same custom sort options in the sort component in the refine modal', () => {
      visitRefineContent();

      scope(
        'when checking the custom sort options passed to the quantic sort component in the main page',
        () => {
          Expect.displaySortDropdown(true);
          Actions.openSortDropdown();

          Expect.containsOptions(customSortOptionsValues);
          Expect.optionsEqual(customSortOptions);
        }
      );

      scope(
        'when checking the custom sort options passed to the quantic sort component in the refine modal',
        () => {
          Expect.displayRefineModalSort(true);
          Actions.openRefineModalSortDropdown();

          Expect.refineContainsOptions(customSortOptionsValues);
          Expect.refineOptionsEqual(customSortOptions);
        }
      );
    });
  });
});
