import {
  CategoryFacetSelectors,
  categoryFacetComponent,
} from './category-facet-selectors';
import * as CategoryFacetAssertions from './category-facet-assertions';
import * as CommonAssertions from '../../common-assertions';
import * as CommonFacetAssertions from '../facet-common-assertions';
import {
  selectChildValueAt,
  canadaHierarchyIndex,
  canadaHierarchy,
  defaultNumberOfValues,
  togoHierarchy,
  addCategoryFacet,
  hierarchicalField,
  selectSearchResultAt,
} from './category-facet-actions';
import {TestFixture} from '../../../fixtures/test-fixture';
import {typeFacetSearchQuery} from '../facet-common-actions';

describe('Category Facet Test Suites', () => {
  describe('with default settings', () => {
    function setupWithDefaultSettings() {
      new TestFixture().with(addCategoryFacet()).init();
    }

    describe('verify rendering', () => {
      before(setupWithDefaultSettings);

      CommonAssertions.assertAccessibility(categoryFacetComponent);
      CommonAssertions.assertContainsComponentError(
        CategoryFacetSelectors,
        false
      );
      CommonFacetAssertions.assertDisplayFacet(CategoryFacetSelectors, true);
      CommonFacetAssertions.assertDisplayPlaceholder(
        CategoryFacetSelectors,
        false
      );
      CategoryFacetAssertions.assertNumberOfChildValues(defaultNumberOfValues);
      CategoryFacetAssertions.assertNumberOfParentValues(0);
      CommonFacetAssertions.assertDisplayShowMoreButton(
        CategoryFacetSelectors,
        true
      );
      CommonFacetAssertions.assertDisplayShowLessButton(
        CategoryFacetSelectors,
        false
      );
      CategoryFacetAssertions.assertDisplaySearchInput(false);
      CommonFacetAssertions.assertDisplayClearButton(
        CategoryFacetSelectors,
        false
      );
      CommonFacetAssertions.assertLabelContains(
        CategoryFacetSelectors,
        'Atlas'
      );
      CategoryFacetAssertions.assertValuesSortedByOccurences();
    });

    describe('when selecting a value to go deeper one level (2nd level of the dataset)', () => {
      function setupGoDeeperOneLevel() {
        setupWithDefaultSettings();
        selectChildValueAt(canadaHierarchyIndex[0]);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      const selectedPath = canadaHierarchy.slice(0, 1);

      describe('verify rendering', () => {
        before(setupGoDeeperOneLevel);

        CommonAssertions.assertAccessibility(categoryFacetComponent);
        CommonFacetAssertions.assertDisplayClearButton(
          CategoryFacetSelectors,
          true
        );
        CategoryFacetAssertions.assertNumberOfChildValues(
          defaultNumberOfValues
        );
        CategoryFacetAssertions.assertNumberOfParentValues(1);
        CommonFacetAssertions.assertDisplayShowMoreButton(
          CategoryFacetSelectors,
          true
        );
        CommonFacetAssertions.assertDisplayShowLessButton(
          CategoryFacetSelectors,
          false
        );
        CategoryFacetAssertions.assertPathInBreadcrumb(selectedPath);
        CategoryFacetAssertions.assertPathInUrl(selectedPath);
      });

      describe('verify analytics', () => {
        before(setupGoDeeperOneLevel);
        CategoryFacetAssertions.assertLogFacetSelect(selectedPath);
      });

      describe('when selecting the "Show more" button', () => {
        function setupShowMore() {
          setupGoDeeperOneLevel();
          cy.wait(TestFixture.interceptAliases.UA);
          CategoryFacetSelectors.showMoreButton().click();
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupShowMore);
          CategoryFacetAssertions.assertNumberOfChildValues(
            defaultNumberOfValues * 2
          );
          CommonFacetAssertions.assertDisplayShowLessButton(
            CategoryFacetSelectors,
            true
          );
        });

        describe('verify analytics', () => {
          before(setupShowMore);
          CategoryFacetAssertions.assertLogFacetShowMore();
        });

        describe('when selecting the "Show less" button', () => {
          function setupShowLess() {
            setupShowMore();
            cy.wait(TestFixture.interceptAliases.UA);
            CategoryFacetSelectors.showLessButton().click();
            cy.wait(TestFixture.interceptAliases.Search);
            cy.wait(200); // flakiness prevention
          }

          describe('verify rendering', () => {
            before(setupShowLess);
            CategoryFacetAssertions.assertNumberOfChildValues(
              defaultNumberOfValues
            );
            CommonFacetAssertions.assertDisplayShowLessButton(
              CategoryFacetSelectors,
              false
            );
          });

          describe('verify analytics', () => {
            before(setupShowLess);
            CategoryFacetAssertions.assertLogFacetShowLess();
          });
        });
      });

      describe('when selecting the "All Categories" button', () => {
        function setupClear() {
          setupGoDeeperOneLevel();
          cy.wait(TestFixture.interceptAliases.UA);
          CategoryFacetSelectors.clearButton().click();
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupClear);
          CommonFacetAssertions.assertDisplayClearButton(
            CategoryFacetSelectors,
            false
          );
          CategoryFacetAssertions.assertNumberOfParentValues(0);
          CategoryFacetAssertions.assertNoBreadcrumb();
          CategoryFacetAssertions.assertNoPathInUrl();
        });

        describe('verify analytics', () => {
          before(setupClear);
          CategoryFacetAssertions.assertLogClearFacetValues();
        });
      });
    });

    describe('when selecting values subsequently to go deeper three level (last level of the dataset)', () => {
      function setupGoDeeperLastLevel() {
        setupWithDefaultSettings();
        selectChildValueAt(canadaHierarchyIndex[0]);
        cy.wait(TestFixture.interceptAliases.UA);
        selectChildValueAt(canadaHierarchyIndex[1]);
        cy.wait(TestFixture.interceptAliases.UA);
        selectChildValueAt(canadaHierarchyIndex[2]);
        cy.wait(TestFixture.interceptAliases.UA);
        selectChildValueAt(canadaHierarchyIndex[3]);
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupGoDeeperLastLevel);
        CommonFacetAssertions.assertDisplayClearButton(
          CategoryFacetSelectors,
          true
        );
        CategoryFacetAssertions.assertNumberOfParentValues(4);
        CategoryFacetAssertions.assertNumberOfChildValues(0);
        CommonFacetAssertions.assertDisplayShowMoreButton(
          CategoryFacetSelectors,
          false,
          false
        );
        CommonFacetAssertions.assertDisplayShowLessButton(
          CategoryFacetSelectors,
          false,
          false
        );
        CategoryFacetAssertions.assertPathInBreadcrumb(canadaHierarchy);
        CategoryFacetAssertions.assertPathInUrl(canadaHierarchy);
      });

      describe('verify analytics', () => {
        before(setupGoDeeperLastLevel);
        CategoryFacetAssertions.assertLogFacetSelect(canadaHierarchy);
      });

      describe('when selecting the first parent button', () => {
        function setupSelectFirstParent() {
          setupGoDeeperLastLevel();
          cy.wait(TestFixture.interceptAliases.UA);
          CategoryFacetSelectors.parentValue().first().click();
          cy.wait(TestFixture.interceptAliases.Search);
        }

        const selectedPath = canadaHierarchy.slice(0, 1);

        describe('verify rendering', () => {
          before(setupSelectFirstParent);
          CommonFacetAssertions.assertDisplayClearButton(
            CategoryFacetSelectors,
            true
          );
          CategoryFacetAssertions.assertNumberOfParentValues(1);
          CategoryFacetAssertions.assertNumberOfChildValues(
            defaultNumberOfValues
          );
          CommonFacetAssertions.assertDisplayShowMoreButton(
            CategoryFacetSelectors,
            true
          );
          CommonFacetAssertions.assertDisplayShowLessButton(
            CategoryFacetSelectors,
            false
          );
          CategoryFacetAssertions.assertPathInBreadcrumb(selectedPath);
          CategoryFacetAssertions.assertPathInUrl(selectedPath);
        });

        describe('verify analytics', () => {
          before(setupSelectFirstParent);
          CategoryFacetAssertions.assertLogFacetSelect(selectedPath);
        });
      });
    });

    describe('when selecting the "Show more" button', () => {
      function setupShowMore() {
        setupWithDefaultSettings();
        CategoryFacetSelectors.showMoreButton().click();
        cy.wait(TestFixture.interceptAliases.Search);
      }

      describe('verify rendering', () => {
        before(setupShowMore);
        CategoryFacetAssertions.assertNumberOfChildValues(7);
        CommonFacetAssertions.assertDisplayShowMoreButton(
          CategoryFacetSelectors,
          false
        );
        CommonFacetAssertions.assertDisplayShowLessButton(
          CategoryFacetSelectors,
          true
        );
      });

      describe('verify analytics', () => {
        before(setupShowMore);
        CategoryFacetAssertions.assertLogFacetShowMore();
      });

      describe('when selecting the "Show less" button', () => {
        function setupShowLess() {
          setupShowMore();
          cy.wait(TestFixture.interceptAliases.UA);
          CategoryFacetSelectors.showLessButton().click();
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupShowLess);
          CategoryFacetAssertions.assertNumberOfChildValues(
            defaultNumberOfValues
          );
          CommonFacetAssertions.assertDisplayShowMoreButton(
            CategoryFacetSelectors,
            true
          );
          CommonFacetAssertions.assertDisplayShowLessButton(
            CategoryFacetSelectors,
            false
          );
        });

        describe('verify analytics', () => {
          before(setupShowLess);
          CategoryFacetAssertions.assertLogFacetShowLess();
        });
      });
    });
  });

  describe('with custom #numberOfValues', () => {
    const numberOfValues = 2;
    function setupCustomNumberOfValues() {
      new TestFixture()
        .with(addCategoryFacet({'number-of-values': numberOfValues}))
        .init();
    }

    before(setupCustomNumberOfValues);

    CategoryFacetAssertions.assertNumberOfChildValues(numberOfValues);

    describe('when selecting a value to go deeper one level (2nd level of the dataset)', () => {
      before(() => {
        setupCustomNumberOfValues();
        selectChildValueAt(0);
      });

      CategoryFacetAssertions.assertNumberOfChildValues(numberOfValues);
    });
  });

  describe('with custom #sortCriteria, alphanumeric', () => {
    before(() => {
      new TestFixture()
        .with(addCategoryFacet({'sort-criteria': 'alphanumeric'}))
        .init();
    });
    CategoryFacetAssertions.assertValuesSortedAlphanumerically();
  });

  describe('with a selected path in the URL', () => {
    before(() => {
      new TestFixture()
        .with(addCategoryFacet({}, true))
        .withHash('cf[geographicalhierarchy]=Africa,Togo')
        .init();
    });

    CommonFacetAssertions.assertDisplayClearButton(
      CategoryFacetSelectors,
      true
    );
    CategoryFacetAssertions.assertNumberOfParentValues(2);
    CategoryFacetAssertions.assertNumberOfSearchResults(1);
    CategoryFacetAssertions.assertFirstChildContains(togoHierarchy[2]);
  });

  describe('with #basePath & #filterByBasePath set to true (default)', () => {
    before(() => {
      new TestFixture()
        .with(
          addCategoryFacet(
            {'base-path': togoHierarchy.slice(0, 2).join(',')},
            true
          )
        )
        .init();
    });

    CategoryFacetAssertions.assertNumberOfSearchResults(1);
    CategoryFacetAssertions.assertFirstChildContains(togoHierarchy[2]);
    CommonFacetAssertions.assertDisplayClearButton(
      CategoryFacetSelectors,
      false
    );
    CategoryFacetAssertions.assertNumberOfParentValues(0);
  });

  describe('with #basePath & #filterByBasePath set to false', () => {
    before(() => {
      new TestFixture()
        .with(
          addCategoryFacet(
            {
              'base-path': togoHierarchy.slice(0, 2).join(','),
              'filter-by-base-path': 'false',
            },
            true
          )
        )
        .init();
    });

    CategoryFacetAssertions.assertNumberOfSearchResults(
      defaultNumberOfValues * 2
    );
  });

  describe('when no search has yet been executed', () => {
    before(() => {
      new TestFixture()
        .with(addCategoryFacet())
        .withoutFirstAutomaticSearch()
        .init();
    });

    CommonFacetAssertions.assertDisplayPlaceholder(
      CategoryFacetSelectors,
      true
    );
  });

  describe('with an invalid option', () => {
    before(() => {
      new TestFixture()
        .with(addCategoryFacet({'sort-criteria': 'notasortcriteria'}))
        .init();
    });

    CommonAssertions.assertContainsComponentError(CategoryFacetSelectors, true);
  });

  describe('when field returns no results', () => {
    before(() => {
      new TestFixture()
        .with(addCategoryFacet({field: 'notanactualfield'}))
        .init();
    });

    CommonFacetAssertions.assertDisplayFacet(CategoryFacetSelectors, false);
  });

  describe('with "with-search" set to "true"', () => {
    function setupWithFacetSearch() {
      new TestFixture().with(addCategoryFacet({'with-search': 'true'})).init();
    }

    describe('verify rendering', () => {
      before(() => {
        setupWithFacetSearch();
      });

      CategoryFacetAssertions.assertDisplaySearchInput(true);
    });

    describe('when searching for a value that returns many results', () => {
      const query = 'mal';
      function setupSearchFor() {
        setupWithFacetSearch();
        typeFacetSearchQuery(CategoryFacetSelectors, query);
      }

      describe('verify rendering', () => {
        before(setupSearchFor);

        CommonAssertions.assertAccessibility(categoryFacetComponent);
        CategoryFacetAssertions.assertNumberOfFacetSearchResults(
          defaultNumberOfValues
        );
        CommonFacetAssertions.assertDisplayMoreMatchesFound(
          CategoryFacetSelectors,
          true
        );
        CommonFacetAssertions.assertDisplayNoMatchesFound(
          CategoryFacetSelectors,
          false
        );
        CommonFacetAssertions.assertMoreMatchesFoundContainsQuery(
          CategoryFacetSelectors,
          query
        );
        CommonFacetAssertions.assertDisplayShowMoreButton(
          CategoryFacetSelectors,
          false,
          false
        );
        CommonFacetAssertions.assertDisplayShowLessButton(
          CategoryFacetSelectors,
          false,
          false
        );
        CommonFacetAssertions.assertDisplaySearchClearButton(
          CategoryFacetSelectors,
          true
        );
        CommonFacetAssertions.assertHighlightsResults(
          CategoryFacetSelectors,
          query
        );
      });

      describe('verify analytics', () => {
        before(setupSearchFor);

        CommonFacetAssertions.assertLogFacetSearch(hierarchicalField);
      });

      describe('when selecting a search result', () => {
        function setupSelectSearchResult() {
          setupSearchFor();
          selectSearchResultAt(2);
          cy.wait(TestFixture.interceptAliases.Search);
        }

        describe('verify rendering', () => {
          before(setupSelectSearchResult);

          CommonFacetAssertions.assertSearchInputEmpty(CategoryFacetSelectors);
          CommonFacetAssertions.assertDisplaySearchClearButton(
            CategoryFacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayMoreMatchesFound(
            CategoryFacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayNoMatchesFound(
            CategoryFacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayClearButton(
            CategoryFacetSelectors,
            true
          );
          CategoryFacetAssertions.assertNumberOfFacetSearchResults(0);
          CategoryFacetAssertions.assertNumberOfChildValues(1);
          CategoryFacetAssertions.assertNumberOfParentValues(2);
          CommonFacetAssertions.assertSearchInputEmpty(CategoryFacetSelectors);
        });
      });

      describe('when clearing the facet search results', () => {
        function setupClearFacetSearchResults() {
          setupSearchFor();
          CategoryFacetSelectors.searchClearButton().click();
        }

        describe('verify rendering', () => {
          before(setupClearFacetSearchResults);

          CommonFacetAssertions.assertSearchInputEmpty(CategoryFacetSelectors);
          CommonFacetAssertions.assertDisplaySearchClearButton(
            CategoryFacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayMoreMatchesFound(
            CategoryFacetSelectors,
            false
          );
          CommonFacetAssertions.assertDisplayNoMatchesFound(
            CategoryFacetSelectors,
            false
          );
          CategoryFacetAssertions.assertNumberOfFacetSearchResults(0);
          CommonFacetAssertions.assertSearchInputEmpty(CategoryFacetSelectors);
        });
      });
    });

    describe('when searching for a value that returns no results', () => {
      const query = 'nonono';
      function setupSearchForNoValues() {
        setupWithFacetSearch();
        typeFacetSearchQuery(CategoryFacetSelectors, query);
      }

      describe('verify rendering', () => {
        before(setupSearchForNoValues);

        CategoryFacetAssertions.assertNumberOfFacetSearchResults(0);
        CommonFacetAssertions.assertDisplayMoreMatchesFound(
          CategoryFacetSelectors,
          false
        );
        CommonFacetAssertions.assertDisplayNoMatchesFound(
          CategoryFacetSelectors,
          true
        );
        CommonFacetAssertions.assertNoMatchesFoundContainsQuery(
          CategoryFacetSelectors,
          query
        );
        CommonFacetAssertions.assertDisplaySearchClearButton(
          CategoryFacetSelectors,
          true
        );
      });
    });
  });
});
