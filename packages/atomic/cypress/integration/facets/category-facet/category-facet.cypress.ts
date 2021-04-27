import {buildTestUrl, RouteAlias} from '../../../utils/setupComponent';
import {
  canadaHierarchy,
  canadaHierarchyIndex,
  CategoryFacetSelectors,
  defaultNumberOfValues,
  togoHierarchy,
} from './category-facet-selectors';
import * as CategoryFacetAssertions from './category-facet-assertions';
import {selectChildValueAt, setupCategoryFacet} from './category-facet.actions';

describe('Category Facet Test Suites', () => {
  describe('with default settings', () => {
    function setupWithDefaultSettings() {
      setupCategoryFacet();
      cy.wait(RouteAlias.search);
    }

    describe('verify rendering', () => {
      before(setupWithDefaultSettings);

      CategoryFacetAssertions.assertAccessibility();
      CategoryFacetAssertions.assertContainsComponentError(false);
      CategoryFacetAssertions.assertDisplayFacet(true);
      CategoryFacetAssertions.assertDisplayPlaceholder(false);
      CategoryFacetAssertions.assertNumberOfChildValues(defaultNumberOfValues);
      CategoryFacetAssertions.assertNumberOfParentValues(0);
      CategoryFacetAssertions.assertDisplayShowMoreButton(true);
      CategoryFacetAssertions.assertDisplayShowLessButton(false);
      CategoryFacetAssertions.assertDisplaySearch(false);
      CategoryFacetAssertions.assertDisplayClearButton(false);
      CategoryFacetAssertions.assertLabelContains('Atlas');
      CategoryFacetAssertions.assertValuesSortedByOccurences();
    });

    describe('when selecting a value to go deeper one level (2nd level of the dataset)', () => {
      function setupGoDeeperOneLevel() {
        setupWithDefaultSettings();
        cy.wait(RouteAlias.analytics);
        selectChildValueAt(canadaHierarchyIndex[0]);
        cy.wait(RouteAlias.search);
      }

      const selectedPath = canadaHierarchy.slice(0, 1);

      describe('verify rendering', () => {
        before(setupGoDeeperOneLevel);

        CategoryFacetAssertions.assertAccessibility();
        CategoryFacetAssertions.assertDisplayClearButton(true);
        CategoryFacetAssertions.assertNumberOfChildValues(
          defaultNumberOfValues
        );
        CategoryFacetAssertions.assertNumberOfParentValues(1);
        CategoryFacetAssertions.assertDisplayShowMoreButton(true);
        CategoryFacetAssertions.assertDisplayShowLessButton(false);
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
          cy.wait(RouteAlias.analytics);
          CategoryFacetSelectors.showMoreButton().click();
          cy.wait(RouteAlias.search);
        }

        describe('verify rendering', () => {
          before(setupShowMore);
          CategoryFacetAssertions.assertNumberOfChildValues(10);
          CategoryFacetAssertions.assertDisplayShowLessButton(true);
        });

        describe('verify analytics', () => {
          before(setupShowMore);
          CategoryFacetAssertions.assertLogFacetShowMore();
        });

        describe('when selecting the "Show less" button', () => {
          function setupShowLess() {
            setupShowMore();
            cy.wait(RouteAlias.analytics);
            CategoryFacetSelectors.showLessButton().click();
            cy.wait(RouteAlias.search);
            cy.wait(200); // flakiness prevention
          }

          describe('verify rendering', () => {
            before(setupShowLess);
            CategoryFacetAssertions.assertNumberOfChildValues(5);
            CategoryFacetAssertions.assertDisplayShowLessButton(false);
          });

          describe('verify analytics', () => {
            before(setupShowLess);
            CategoryFacetAssertions.assertLogFacetShowLess();
          });
        });
      });

      describe('when selecting the "All categories" button', () => {
        function setupClear() {
          setupGoDeeperOneLevel();
          cy.wait(RouteAlias.analytics);
          CategoryFacetSelectors.clearButton().click();
          cy.wait(RouteAlias.search);
        }

        describe('verify rendering', () => {
          before(setupClear);
          CategoryFacetAssertions.assertDisplayClearButton(false);
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
        cy.wait(RouteAlias.analytics);
        selectChildValueAt(canadaHierarchyIndex[0]);
        cy.wait(RouteAlias.analytics);
        selectChildValueAt(canadaHierarchyIndex[1]);
        cy.wait(RouteAlias.analytics);
        selectChildValueAt(canadaHierarchyIndex[2]);
        cy.wait(RouteAlias.analytics);
        selectChildValueAt(canadaHierarchyIndex[3]);
        cy.wait(RouteAlias.search);
      }

      describe('verify rendering', () => {
        before(setupGoDeeperLastLevel);
        CategoryFacetAssertions.assertDisplayClearButton(true);
        CategoryFacetAssertions.assertNumberOfParentValues(4);
        CategoryFacetAssertions.assertNumberOfChildValues(0);
        CategoryFacetAssertions.assertDisplayShowMoreButton(false);
        CategoryFacetAssertions.assertDisplayShowLessButton(false);
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
          cy.wait(RouteAlias.analytics);
          CategoryFacetSelectors.parentValue().first().click();
          cy.wait(RouteAlias.search);
        }

        const selectedPath = canadaHierarchy.slice(0, 1);

        describe('verify rendering', () => {
          before(setupSelectFirstParent);
          CategoryFacetAssertions.assertDisplayClearButton(true);
          CategoryFacetAssertions.assertNumberOfParentValues(1);
          CategoryFacetAssertions.assertNumberOfChildValues(
            defaultNumberOfValues
          );
          CategoryFacetAssertions.assertDisplayShowMoreButton(true);
          CategoryFacetAssertions.assertDisplayShowLessButton(false);
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
        cy.wait(RouteAlias.analytics);
        CategoryFacetSelectors.showMoreButton().click();
        cy.wait(RouteAlias.search);
      }

      describe('verify rendering', () => {
        before(setupShowMore);
        CategoryFacetAssertions.assertNumberOfChildValues(7);
        CategoryFacetAssertions.assertDisplayShowLessButton(true);
        CategoryFacetAssertions.assertDisplayShowMoreButton(false);
      });

      describe('verify analytics', () => {
        before(setupShowMore);
        CategoryFacetAssertions.assertLogFacetShowMore();
      });

      describe('when selecting the "Show less" button', () => {
        function setupShowLess() {
          setupShowMore();
          cy.wait(RouteAlias.analytics);
          CategoryFacetSelectors.showLessButton().click();
          cy.wait(RouteAlias.search);
        }

        describe('verify rendering', () => {
          before(setupShowLess);
          CategoryFacetAssertions.assertNumberOfChildValues(5);
          CategoryFacetAssertions.assertDisplayShowLessButton(false);
          CategoryFacetAssertions.assertDisplayShowMoreButton(true);
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
      setupCategoryFacet({attributes: `number-of-values="${numberOfValues}"`});
      cy.wait(RouteAlias.search);
    }

    before(setupCustomNumberOfValues);

    CategoryFacetAssertions.assertNumberOfChildValues(numberOfValues);

    describe('when selecting a value to go deeper one level (2nd level of the dataset)', () => {
      before(() => {
        setupCustomNumberOfValues();
        selectChildValueAt(0);
        cy.wait(RouteAlias.search);
      });

      CategoryFacetAssertions.assertNumberOfChildValues(numberOfValues);
    });
  });

  describe('with custom #sortCriteria, alphanumeric', () => {
    before(() => {
      setupCategoryFacet({attributes: 'sort-criteria="alphanumeric"'});
    });
    CategoryFacetAssertions.assertValuesSortedAlphanumerically();
  });

  // TODO: enable with new setup
  describe.skip('with a selected path in the URL', () => {
    before(() => {
      setupCategoryFacet({
        withResultList: true,
      });
      cy.visit(
        buildTestUrl(
          `cf[geographicalhierarchy]=${togoHierarchy.slice(0, 2).join(',')}`
        )
      );
      cy.wait(RouteAlias.search);
    });

    CategoryFacetAssertions.assertDisplayClearButton(true);
    CategoryFacetAssertions.assertNumberOfParentValues(2);
    CategoryFacetAssertions.assertNumberOfSearchResults(1);
    CategoryFacetAssertions.assertFirstChildContains(togoHierarchy[2]);
  });

  describe('with #basePath & #filterByBasePath set to true (default)', () => {
    before(() => {
      setupCategoryFacet({
        attributes: `base-path="${togoHierarchy.slice(0, 2).join(',')}"`,
        withResultList: true,
      });
    });

    CategoryFacetAssertions.assertNumberOfSearchResults(1);
    CategoryFacetAssertions.assertFirstChildContains(togoHierarchy[2]);
    CategoryFacetAssertions.assertDisplayClearButton(false);
    CategoryFacetAssertions.assertNumberOfParentValues(0);
  });

  describe('with #basePath & #filterByBasePath set to false', () => {
    before(() => {
      setupCategoryFacet({
        attributes: `base-path="${togoHierarchy
          .slice(0, 2)
          .join(',')}" filter-by-base-path="false"`,
        withResultList: true,
      });
    });

    CategoryFacetAssertions.assertNumberOfSearchResults(10);
  });

  describe('when no search has yet been executed', () => {
    before(() => {
      setupCategoryFacet({executeFirstSearch: false});
    });

    CategoryFacetAssertions.assertDisplayPlaceholder(true);
  });

  describe('with an invalid option', () => {
    before(() => {
      setupCategoryFacet({attributes: 'sort-criteria="notasortcriteria"'});
    });

    CategoryFacetAssertions.assertContainsComponentError(true);
  });

  describe('when field returns no results', () => {
    before(() => {
      setupCategoryFacet({field: 'notanactualfield'});
    });

    CategoryFacetAssertions.assertDisplayFacet(false);
  });

  // See category-facet-search.cypress.ts for more facet search tests
  describe('with #enableFacetSearch set to true', () => {
    before(() => {
      setupCategoryFacet({attributes: 'enable-facet-search'});
    });
    CategoryFacetAssertions.assertDisplaySearch(true);
  });
});
