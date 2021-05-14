import {RouteAlias} from '../../../utils/setupComponent';
import {CategoryFacetSearchSelectors} from './category-facet-search-selectors';
import {
  defaultNumberOfValues,
  setupCategoryFacet,
  quebecHierarchy,
  togoHierarchy,
  selectChildValueAt,
} from './category-facet-actions';
import * as CategoryFacetAssertions from './category-facet-assertions';
import * as CategoryFacetSearchAssertions from './category-facet-search-assertions';

function typeQuery(query: string, keyboardInteractions = '') {
  CategoryFacetSearchSelectors.searchInput().type(
    query + keyboardInteractions,
    {
      force: true,
      delay: 200,
    }
  );

  cy.wait(RouteAlias.facetSearch); // for focus
  for (let index = 0; index < query.length; index++) {
    cy.wait(RouteAlias.facetSearch);
    cy.wait(RouteAlias.analytics);
  }
}

describe('Category Facet Search Test Suites', () => {
  function setupWithFacetSearch() {
    setupCategoryFacet({
      attributes: `number-of-values=${defaultNumberOfValues} enable-facet-search`,
    });
    cy.wait(RouteAlias.analytics);
  }

  describe('when no values are selected', () => {
    describe('when focusing on the input', () => {
      function setupFocusOnInput() {
        setupWithFacetSearch();
        CategoryFacetSearchSelectors.searchInput().focus();
        cy.wait(RouteAlias.facetSearch);
      }

      describe('verify rendering', () => {
        before(setupFocusOnInput);

        CategoryFacetAssertions.assertAccessibility();
        CategoryFacetSearchAssertions.assertNumberOfSearchResults(
          defaultNumberOfValues * 2
        );
        CategoryFacetSearchAssertions.assertSearchResultLabelAt(
          togoHierarchy[0],
          0
        );
        CategoryFacetSearchAssertions.assertSearchResultCountAt(58, 0);
        CategoryFacetSearchAssertions.assertSearchResultPathAt(
          ['All Categories'],
          0
        );
      });

      describe('verify analytics', () => {
        before(setupFocusOnInput);

        CategoryFacetSearchAssertions.assertLogFacetSearch();
      });
    });

    describe('when typing in a query that yield results', () => {
      const query = 'Queb';
      function setupQuery() {
        setupWithFacetSearch();

        typeQuery(query);
      }

      describe('verify rendering', () => {
        before(setupQuery);
        CategoryFacetSearchAssertions.assertDisplayNoValuesFound(false);
        CategoryFacetSearchAssertions.assertNumberOfSearchResults(2);
        CategoryFacetSearchAssertions.assertSearchResultLabelHighlightAt(
          query,
          0
        );
      });

      describe('verify analytics', () => {
        before(setupQuery);
        CategoryFacetSearchAssertions.assertLogFacetSearch();
      });

      describe('when clicking on a result', () => {
        function setupClickResult() {
          setupQuery();
          cy.wait(RouteAlias.analytics);

          CategoryFacetSearchSelectors.searchResultButton().last().click();
          cy.wait(RouteAlias.search);
        }

        describe('verify rendering', () => {
          before(setupClickResult);
          CategoryFacetSearchAssertions.assertDisplaySearchResults(false);
          CategoryFacetSearchAssertions.assertInputEmpty();
          CategoryFacetAssertions.assertPathInBreadcrumb(quebecHierarchy);
          CategoryFacetAssertions.assertPathInUrl(quebecHierarchy);
          CategoryFacetAssertions.assertNumberOfParentValues(
            quebecHierarchy.length
          );
          CategoryFacetAssertions.assertNumberOfChildValues(0);
        });

        describe('verify analytics', () => {
          before(setupClickResult);
          CategoryFacetAssertions.assertLogFacetSelect(quebecHierarchy);
        });
      });
    });

    describe('when pressing the down arrow key', () => {
      function setupPressDownArrow() {
        setupWithFacetSearch();
        typeQuery('a', '{downarrow}');
      }

      describe('verify rendering', () => {
        before(setupPressDownArrow);

        CategoryFacetAssertions.assertAccessibility();
        CategoryFacetSearchAssertions.assertNumberOfSearchResults(
          defaultNumberOfValues * 2
        );
        CategoryFacetSearchAssertions.assertActiveResult(togoHierarchy[0]);
      });

      describe('when selecting the current selected result by pressing the enter key', () => {
        function setupPressEnter() {
          setupWithFacetSearch();

          typeQuery('a', '{downarrow}{enter}');
          cy.wait(RouteAlias.analytics);
          cy.wait(RouteAlias.search);
        }

        const selectedPath = togoHierarchy.slice(0, 1);

        describe('verify rendering', () => {
          before(setupPressEnter);

          CategoryFacetSearchAssertions.assertDisplaySearchResults(false);
          CategoryFacetSearchAssertions.assertInputEmpty();
          CategoryFacetAssertions.assertPathInBreadcrumb(selectedPath);
          CategoryFacetAssertions.assertPathInUrl(selectedPath);
          CategoryFacetAssertions.assertNumberOfParentValues(1);
          CategoryFacetAssertions.assertNumberOfChildValues(
            defaultNumberOfValues
          );
        });

        describe('verify analytics', () => {
          before(setupPressEnter);

          CategoryFacetAssertions.assertLogFacetSelect(selectedPath);
        });
      });
    });

    describe('when pressing up the arrow key', () => {
      before(() => {
        setupWithFacetSearch();
        typeQuery('a', '{uparrow}');
        cy.wait(RouteAlias.facetSearch);
      });

      CategoryFacetSearchAssertions.assertNumberOfSearchResults(
        defaultNumberOfValues * 4
      );
      CategoryFacetSearchAssertions.assertActiveResult('Gitega');
    });

    describe('when bluring the input by pressing the escape key', () => {
      before(() => {
        setupWithFacetSearch();
        typeQuery('a', '{esc}');
      });

      CategoryFacetSearchAssertions.assertSearchCleared();
    });

    describe("when typing in a query doesn't yield results", () => {
      before(() => {
        setupWithFacetSearch();
        typeQuery('tibet');
      });

      CategoryFacetSearchAssertions.assertNumberOfSearchResults(0);
      CategoryFacetSearchAssertions.assertDisplayNoValuesFound(true);
    });
  });

  describe('when a path is selected', () => {
    before(() => {
      setupWithFacetSearch();
      selectChildValueAt(1);
      cy.wait(RouteAlias.search);
      cy.wait(RouteAlias.analytics);
      CategoryFacetSearchSelectors.searchInput().focus();
      cy.wait(RouteAlias.facetSearch);
    });

    CategoryFacetSearchAssertions.assertSearchResultLabelAt('Algeria', 0);
  });
});
