import {configure} from '../../../page-objects/configurator';

import {CategoryFacetExpectations as Expect} from './category-facet-expectations';
import {
  montrealHierarchy,
  CategoryFacetActions as Actions,
  togoHierarchy,
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

const hierarchicalField = 'geographicalhierarchy';

describe('quantic-category-facet', () => {
  const pageUrl = 's/quantic-category-facet';

  const defaultField = 'geographicalhierarchy';
  const defaultLabel = 'Country';
  const defaultNumberOfValues = 8;
  const customNumberOfValues = 4;
  const defaultSettings = {
    field: defaultField,
    label: defaultLabel,
    numberOfValues: defaultNumberOfValues,
  };
  const searchEnabledSettings = {
    field: defaultField,
    label: defaultLabel,
    numberOfValues: defaultNumberOfValues,
    withSearch: true,
  };
  const customBasePathWithFilterByBasePathSettings = {
    field: defaultField,
    label: defaultLabel,
    numberOfValues: defaultNumberOfValues,
    basePath: togoHierarchy.slice(0, 2).join(','),
    noFilterByBasePath: true,
  };
  const customNumberOfValuesSettings = {
    field: defaultField,
    label: defaultLabel,
    numberOfValues: customNumberOfValues,
  };

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

  function loadFromUrlHash(
    options: Partial<CategoryFacetOptions> = {},
    urlHash: string
  ) {
    interceptSearch();
    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
    cy.wait(InterceptAliases.Search);
  }

  function setupWithCustomBasePath(hierarchy: string[], search?: boolean) {
    visitCategoryFacetPage(
      {
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
        basePath: hierarchy.slice(0, 2).join(','),
        withSearch: search ? search : false,
      },
      false
    );
  }

  function setupWithCustomDelimitingCharacter() {
    visitCategoryFacetPage(
      {
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
        delimitingCharacter: '/',
      },
      true
    );
  }

  function setupGoDeeperOneLevel() {
    visitCategoryFacetPage(defaultSettings);
    Actions.selectChildValue(montrealHierarchy[0]);
  }

  function setupShowMore() {
    setupGoDeeperOneLevel();
    Actions.clickShowMoreButton();
  }

  function setupShowLess() {
    setupShowMore();
    cy.wait(InterceptAliases.Search);
    Actions.clickShowLessButton();
  }

  function setupGoDeeperFourLevels() {
    visitCategoryFacetPage(defaultSettings);
    Actions.selectChildValue(montrealHierarchy[0]);
    cy.wait(InterceptAliases.UA.Facet.Select);
    Actions.selectChildValue(montrealHierarchy[1]);
    cy.wait(InterceptAliases.UA.Facet.Select);
    Actions.selectChildValue(montrealHierarchy[2]);
    cy.wait(InterceptAliases.UA.Facet.Select);
    Actions.selectChildValue(montrealHierarchy[3]);
    cy.wait(InterceptAliases.UA.Facet.Select);
  }

  describe('with default category facet', () => {
    it('should work as expected', () => {
      visitCategoryFacetPage(defaultSettings);

      Expect.displayFacet(true);
      Expect.displayLabel(true);
      Expect.displayFacetCount(true);
      Expect.displaySearchInput(false);
      Expect.numberOfValues(defaultNumberOfValues - 1);
    });

    describe('when selecting on the level data set', () => {
      it('should bold the selected parent level', () => {
        visitCategoryFacetPage(defaultSettings);
        // Verify all levels
        montrealHierarchy.forEach((value, index) => {
          const selectedPath = montrealHierarchy.slice(0, index + 1);

          Actions.selectChildValue(value);

          Expect.logCategoryFacetSelected(selectedPath);
          Expect.numberOfParentValues(index + 1);
          Expect.parentValueLabel(value);
          Expect.urlHashContains(selectedPath);
        });
      });
    });

    describe('when selecting ShowMore button', () => {
      it('should double the existing list of child level', () => {
        const selectedPath = montrealHierarchy.slice(0, 1);
        setupShowMore();

        Expect.numberOfParentValues(1);
        Expect.parentValueLabel(selectedPath[0]);
        Expect.numberOfChildValues(defaultNumberOfValues * 2);
        Expect.displayShowMoreButton(true);
        Expect.displayShowLessButton(true);
        Expect.urlHashContains(selectedPath);
        Expect.logCategoryFacetSelected(selectedPath);
      });
    });

    describe('when selecting ShowLess button', () => {
      it('should collapsed the child list to default', () => {
        const selectedPath = montrealHierarchy.slice(0, 1);
        setupShowLess();

        Expect.numberOfParentValues(1);
        Expect.parentValueLabel(selectedPath[0]);
        Expect.numberOfChildValues(defaultNumberOfValues);
        Expect.displayShowMoreButton(true);
        Expect.displayShowLessButton(false);
        Expect.urlHashContains(selectedPath);
        Expect.logCategoryFacetSelected(selectedPath);
      });
    });

    describe('when selecting value on 4nd level of data', () => {
      it('should redirect user up to parent level', () => {
        setupGoDeeperFourLevels();

        montrealHierarchy
          .slice(0, 3)
          .reverse()
          .forEach((value, index) => {
            const selectedPath = montrealHierarchy.slice(0, 3 - index);

            Actions.selectParentValue(value);

            Expect.logCategoryFacetSelected(selectedPath);
            Expect.numberOfParentValues(3 - index);
            Expect.parentValueLabel(value);
            Expect.urlHashContains(selectedPath);
          });
      });

      describe('when selecting "All Categories"', () => {
        it('should redirect me to very first level of data set', () => {
          setupGoDeeperFourLevels();

          Actions.clickAllCategories();

          Expect.logClearFacetValues(hierarchicalField);
          Expect.numberOfParentValues(0);
          Expect.numberOfValues(defaultNumberOfValues - 1);
          Expect.noUrlHash();
        });
      });
    });
    describe('when loading a path in the URL', () => {
      it('should bold the parent and show the children values', () => {
        const path = 'Africa,Togo';
        const togo = 'Togo';
        loadFromUrlHash(
          {
            field: defaultField,
            label: defaultLabel,
            numberOfValues: defaultNumberOfValues,
          },
          `cf[geographicalhierarchy]=${path}`
        );

        Expect.logFacetLoad();
        Expect.numberOfParentValues(2);
        Expect.parentValueLabel(togo);
      });
    });
  });

  describe('with option search is enabled in category facet', () => {
    describe('when typing into facet search input box', () => {
      it('facet value should be filtered to match with the keywords', () => {
        const query = 'mal';
        visitCategoryFacetPage(searchEnabledSettings);

        Actions.typeQueryInSearchInput(query);

        Expect.logFacetSearch(hierarchicalField);
        Expect.displayFacet(true);
        Expect.displayNoMatchesFound(false);
        Expect.displayMoreMatchesFound(true);
        Expect.moreMatchesFoundContainsQuery(query);
        Expect.highlightsResults(query);
        Expect.displaySearchResultsPath();
        Expect.searchResults(defaultNumberOfValues);
      });
    });

    describe('when selecting a value from the search result', () => {
      it('should select that category facet level', () => {
        const query = 'mont';
        const selectedValue = 'Montreal';

        visitCategoryFacetPage(searchEnabledSettings);

        Actions.typeQueryInSearchInput(query);
        Expect.logFacetSearch(hierarchicalField);

        Actions.selectSearchResult(selectedValue);
        Expect.logCategoryFacetSelected(montrealHierarchy);
        Expect.numberOfParentValues(4);
        Expect.urlHashContains(montrealHierarchy);
      });
    });

    describe('when clearing the facet search results', () => {
      it('should clear the search input', () => {
        const query = 'mont';

        visitCategoryFacetPage(searchEnabledSettings);

        Actions.typeQueryInSearchInput(query);
        Expect.logFacetSearch(hierarchicalField);
        Expect.searchResults(8);

        Actions.clickSearchClearButton();
        Expect.logFacetSearch(hierarchicalField);
        Expect.numberOfValues(defaultNumberOfValues - 1);
        Expect.searchInputEmpty();
      });
    });

    describe('when searching for a random value', () => {
      it('should return no results', () => {
        const query = 'something';

        visitCategoryFacetPage(searchEnabledSettings);

        Actions.typeQueryInSearchInput(query);

        Expect.logFacetSearch(hierarchicalField);
        Expect.displayNoMatchesFound(true);
        Expect.noMatchesFoundContainsQuery(query);
        Expect.displaySearchClearButton(true);
        Expect.searchResults(0);
      });
    });
  });

  describe('setup with custom basePath', () => {
    describe('when loading', () => {
      it('should load the category facet component with data level start from custom basePath', () => {
        setupWithCustomBasePath(togoHierarchy);

        Expect.firstChildContains(togoHierarchy[2]);
        Expect.numberOfParentValues(0);
        Expect.search.numberOfResults(1);

        Actions.selectChildValue(togoHierarchy[2]);
        Expect.logCategoryFacetSelected(togoHierarchy.slice(2, 3));
      });
    });

    describe('when typing into facet search box input', () => {
      it('facet value should be filtered to match with the keywords', () => {
        const basePath = ['North America'];
        const query = 'can';
        const allCategories = 'All Categories';
        setupWithCustomBasePath(basePath, true);

        Actions.typeQueryInSearchInput(query);
        Expect.logFacetSearch(hierarchicalField);
        Expect.searchResults(2);
        Expect.searchResultsPathContains(allCategories);
      });
    });
    describe('when setting filterByBasePath to false', () => {
      it('should display more than one result', () => {
        visitCategoryFacetPage(
          customBasePathWithFilterByBasePathSettings,
          false
        );

        Expect.search.numberOfResults(10);
      });
    });
  });
  describe('setup with custom delimiter', () => {
    it('should show all path in children value', () => {
      const northamericaPath = 'North America';
      const canadaPath = 'North America;Canada';
      setupWithCustomDelimitingCharacter();

      Actions.selectChildValue(northamericaPath);
      Expect.logCategoryFacetSelected(northamericaPath.split(';'));
      Expect.numberOfChildValues(0);
      Expect.numberOfParentValues(1);

      Actions.clickAllCategories();
      Expect.logClearFacetValues(hierarchicalField);

      Actions.selectChildValue(canadaPath);
      Expect.logCategoryFacetSelected(canadaPath.split(';'));
      Expect.numberOfChildValues(0);
      Expect.numberOfParentValues(1);
    });
  });
  describe('setup with custom numberOfValues', () => {
    it('should show custom number of values', () => {
      visitCategoryFacetPage(customNumberOfValuesSettings);

      Expect.numberOfValues(customNumberOfValues);
      Expect.displayShowMoreButton(true);
    });
  });
  describe('with custom sorting', () => {
    ['alphanumeric', 'occurrences'].forEach((sorting) => {
      it(`should use "${sorting}" sorting in the facet request`, () => {
        visitCategoryFacetPage(
          {
            sortCriteria: sorting,
          },
          false
        );
        cy.wait(InterceptAliases.Search).then((interception) => {
          const facetRequest = interception.request.body.facets[0];
          expect(facetRequest.sortCriteria).to.eq(sorting);
        });
      });
    });
  });
  describe('with isCollapsed', () => {
    function setupIsCollapsed() {
      visitCategoryFacetPage({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
        isCollapsed: true,
      });
    }

    it('should render correctly', () => {
      setupIsCollapsed();

      Expect.displayFacet(true);
      Expect.labelContains(defaultLabel);
      Expect.displaySearchInput(false);
      Expect.displayValues(false);
      Expect.displayExpandButton(true);
    });
  });
});
