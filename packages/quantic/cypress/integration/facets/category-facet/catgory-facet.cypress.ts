import {configure} from '../../../page-objects/configurator';

import {CategoryFacetExpectations as Expect} from './category-facet-expectations';
import {
  canadaHierarchy,
  canadaHierarchyIndex,
  CategoryFacetActions as Actions,
} from './category-facet-actions';
import {InterceptAliases, interceptSearch} from '../../../page-objects/search';

interface CategoryFacetOptions {
  field: string;
  label: string;
  basePath: string;
  noFilterByBasePath: boolean;
  noFilterFacetCount: boolean;
  delimitingCharacter: string;
  numberOfValues: number;
  sortCriteria: string;
  withSearch: boolean;
  isCollapsed: boolean;
}

describe('quantic-category-facet', () => {
  const pageUrl = 's/quantic-category-facet';

  const defaultField = 'geographicalhierarchy';
  const defaultLabel = 'Country';
  const defaultNumberOfValues = 8;

  function visitCategoryFacetPage(
    options: Partial<CategoryFacetOptions> = {},
    waitForSearch = true
  ) {
    interceptSearch();
    cy.visit(pageUrl);
    configure(options);
    if (waitForSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }
  function setupWithDefaultSettings() {
    visitCategoryFacetPage(
      {
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
      },
      false
    );
  }

  function setupGoDeeperOneLevel() {
    setupWithDefaultSettings();
    Actions.selectChildValueAt(canadaHierarchyIndex[0]);
  }
  function setupGoDeeperTwoLevels() {
    setupWithDefaultSettings();
    Actions.selectChildValueAt(canadaHierarchyIndex[0]);
    interceptSearch();
    Actions.selectChildValueAt(canadaHierarchyIndex[1]);
    interceptSearch();
  }
  function setupShowMore() {
    setupGoDeeperOneLevel();
    Actions.clickShowMoreButton();
  }
  function setupShowLess() {
    setupShowMore();
    interceptSearch();
    Actions.clickShowLessButton();
  }

  describe('with default category facet', () => {
    it('should work as expected', () => {
      setupWithDefaultSettings();

      Expect.isAccesssible(true);
      Expect.displayLabel(true);
      Expect.displayFacetCount(true);
      Expect.displaySearchInput(false);
      Expect.numberOfValues(7);
    });

    describe('when selecting on the 1st level data set', () => {
      it('should bold the selected parent level', () => {
        const selectedPath = canadaHierarchy.slice(0, 1);
        setupGoDeeperOneLevel();

        Expect.numberOfParentValues(1);
        Expect.parentValueLabel(selectedPath[0]);
        Expect.numberOfChildValues(8);
        Expect.pathInUrl(selectedPath);
        Expect.logCategoryFacetSelected(selectedPath);
      });
    });

    describe('when selecting value subsequently to go next deeper level', () => {
      it('should bold next child level', () => {
        const selectedPath = canadaHierarchy.slice(0, 2);
        setupGoDeeperTwoLevels();

        Expect.numberOfParentValues(1);
        Expect.pathInUrl(selectedPath);
        // Expect.logCategoryFacetSelected(selectedPath);
      });
    });

    describe('when selecting ShowMore button', () => {
      it('should double the existing list of child level', () => {
        const selectedPath = canadaHierarchy.slice(0, 1);
        setupShowMore();

        Expect.numberOfParentValues(1);
        Expect.numberOfChildValues(16);
        Expect.displayShowMoreButton(true);
        Expect.displayShowLessButton(true);
        Expect.pathInUrl(selectedPath);
        Expect.logCategoryFacetSelected(selectedPath);
      });
    });

    describe('when selecting ShowLess button', () => {
      it('should collapsed the child list to default', () => {
        const selectedPath = canadaHierarchy.slice(0, 1);
        setupShowLess();

        Expect.numberOfParentValues(1);
        Expect.numberOfChildValues(8);
        Expect.displayShowMoreButton(true);
        Expect.displayShowLessButton(false);
        Expect.pathInUrl(selectedPath);
        Expect.logCategoryFacetSelected(selectedPath);
      });
    });

    describe('when selecting value on 4nd level of data', () => {
      describe('when selecting the third level', () => {
        it('should redirect user up 1 level of data set', () => {
          // it should filter result
          // it should log UA
        });
      });
      describe('when selecting "All Categories"', () => {
        it('should redirect me to very first level of data set', () => {
          // it should log UA
        });
      });
    });
  });

  describe('with option search is enabled in category facet', () => {
    describe('when typing into facet search input box', () => {
      it('facet value should be filtered to match with the keywords', () => {
        // it should highlight entered keyword
        // it should display result parent patch on the second line
      });
    });

    describe('when selecting a value from the search result', () => {
      it('should select that category facet level', () => {
        // it should expand child list
        // it should filter result
        // it should log UA
      });
    });
  });

  describe('setup with custom basePath', () => {
    describe('when loading', () => {
      it('should load the category facet component with data level start from custom basePath', () => {
        // I can click on the 1st level data set level
      });
    });

    describe('when typing into facet search box input', () => {
      it('facet value should be filtered to match with the keywords', () => {
        // it should only show results from the "North America" data level
      });
    });
  });
});
