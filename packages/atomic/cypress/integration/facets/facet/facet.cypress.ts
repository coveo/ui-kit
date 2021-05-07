import {
  buildTestUrl,
  injectComponent,
  RouteAlias,
  setupIntercept,
} from '../../../utils/setupComponent';
import {
  setupFacet,
  selectFacetValueAt,
  selectShowMoreButton,
  selectShowLessButton,
  selectClearAllFacetsButton,
  facetLabel,
  facetField,
  facetNumberOfValues,
} from './facet-actions';
import {facetComponent} from './facet-selectors';
import * as FacetAssertions from './facet-assertions';

describe('Facet Test Suites', () => {
  describe('Facet with default setting', () => {
    function setupWithDefaultSettings() {
      setupFacet();
      cy.wait(RouteAlias.search);
    }

    describe('verify rendering', () => {
      before(setupWithDefaultSettings);
      FacetAssertions.assertDisplayFacet(true);
      FacetAssertions.assertAccessibility(facetComponent);
      FacetAssertions.assertContainsLabel(facetLabel);
      FacetAssertions.assertNonZeroFacetCount();
      FacetAssertions.assertDisplayFacetSearchbox(true);
      FacetAssertions.assertDisplayShowMoreButton(true);
      FacetAssertions.assertDisplayShowLessButton(false);
      FacetAssertions.assertFacetNumberOfValueEqual(facetNumberOfValues);
      FacetAssertions.assertFacetValuesSortedAlphanumerically(false);
    });

    describe('When user selects 1 facet checkbox', () => {
      function setupFacetWithCheckboxSelected() {
        setupWithDefaultSettings();
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0);
      }
      describe('verify rendering', () => {
        before(setupFacetWithCheckboxSelected);
        FacetAssertions.assertCheckboxDisplay(0, true);
        FacetAssertions.assertNonZeroFacetCount();
        FacetAssertions.assertBreadcrumbDisplayFacetValueAtIndex();
        FacetAssertions.assertFacetValueOnUrl();
      });

      describe('verify analytics', () => {
        beforeEach(setupFacetWithCheckboxSelected);
        FacetAssertions.assertAnalyticLogFacetSelect();
      });
    });

    describe('When user unselects 1 facet checkbox', () => {
      function setupFacetWithCheckboxUnselected() {
        setupWithDefaultSettings();
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0);
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0);
      }
      describe('verify rendering', () => {
        before(setupFacetWithCheckboxUnselected);
        FacetAssertions.assertCheckboxDisplay(0, false);
      });

      describe('verify analytics', () => {
        beforeEach(setupFacetWithCheckboxUnselected);
        FacetAssertions.assertAnalyticLogFacetDeselect();
      });
    });

    describe('When user selects 2 facetValue checkboxes', () => {
      function setupFacetWithTwoCheckboxesSelected() {
        setupWithDefaultSettings();
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0);
        cy.wait(RouteAlias.analytics);
        cy.wait(RouteAlias.search);
        selectFacetValueAt(1);
        cy.wait(RouteAlias.search);
      }

      describe('verify rendering', () => {
        before(setupFacetWithTwoCheckboxesSelected);
        FacetAssertions.assertCheckboxDisplay(0, true);
        FacetAssertions.assertCheckboxDisplay(1, true);
        FacetAssertions.assertBreadcrumbDisplayFacetValueAtIndex();
        FacetAssertions.assertBreadcrumbDisplayFacetValueAtIndex(1);
        FacetAssertions.assertMultipleSelectedFacetValueOnUrl();
      });

      describe('verify analytics', () => {
        beforeEach(setupFacetWithTwoCheckboxesSelected);
        FacetAssertions.assertAnalyticLogMultipleFacetsSelect();
      });
    });

    describe('When user clicks ShowMore button', () => {
      function setupFacetWithSelectedShowMore() {
        setupWithDefaultSettings();
        cy.wait(RouteAlias.analytics);
        selectShowMoreButton();
        cy.wait(RouteAlias.search);
      }

      describe('verify rendering', () => {
        before(setupFacetWithSelectedShowMore);
        FacetAssertions.assertFacetNumberOfValueEqual(facetNumberOfValues * 2);
        FacetAssertions.assertFacetValuesSortedAlphanumerically(true);
        FacetAssertions.assertDisplayShowLessButton(true);
      });

      describe('verify analytics', () => {
        beforeEach(setupFacetWithSelectedShowMore);
        FacetAssertions.assertAnalyticLogShowMoreShowLess('showMore');
      });
    });

    describe('When user clicks ShowLess button', () => {
      function setupFacetWithSelectedShowLess() {
        setupWithDefaultSettings();
        cy.wait(RouteAlias.analytics);
        selectShowMoreButton();
        cy.wait(RouteAlias.search);
        cy.wait(RouteAlias.analytics);
        selectShowLessButton();
        cy.wait(RouteAlias.search);
      }

      describe('verify rendering', () => {
        before(setupFacetWithSelectedShowLess);
        FacetAssertions.assertFacetNumberOfValueEqual(facetNumberOfValues);
        FacetAssertions.assertFacetValuesSortedAlphanumerically(false);
        FacetAssertions.assertDisplayShowLessButton(false);
      });

      describe('verify analytics', () => {
        beforeEach(setupFacetWithSelectedShowLess);
        FacetAssertions.assertAnalyticLogShowMoreShowLess('showLess');
      });
    });

    describe('When user clicks ClearAll facet button', () => {
      function setupFacetWithTwoCheckboxesSelected() {
        setupWithDefaultSettings();
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0);
        cy.wait(RouteAlias.analytics);
        cy.wait(RouteAlias.search);
        selectFacetValueAt(1);
        cy.wait(RouteAlias.analytics);
        cy.wait(RouteAlias.search);
        selectClearAllFacetsButton();
        cy.wait(RouteAlias.search);
      }

      describe('verify rendering', () => {
        before(setupFacetWithTwoCheckboxesSelected);
        FacetAssertions.assertCheckboxDisplay(0, false);
        FacetAssertions.assertCheckboxDisplay(1, false);
      });

      describe('verify analytics', () => {
        beforeEach(setupFacetWithTwoCheckboxesSelected);
        FacetAssertions.assertAnalyticLogClearAllFacets();
      });
    });
  });

  describe('Facet with no facetSearch, and custom numberOfValues is 5', () => {
    const customNumberOfValue = 5;
    function setupCustomFacet() {
      setupFacet({
        attributes: `enable-facet-search=false number-of-values=${customNumberOfValue}`,
      });
      cy.wait(RouteAlias.search);
    }

    describe('verify rendering', () => {
      before(setupCustomFacet);
      FacetAssertions.assertAccessibility(facetComponent);
      FacetAssertions.assertContainsLabel(facetLabel);
      FacetAssertions.assertNonZeroFacetCount();
      FacetAssertions.assertDisplayFacetSearchbox(false);
      FacetAssertions.assertFacetNumberOfValueEqual(customNumberOfValue);
    });

    describe('When user unselects 1 facet checkbox', () => {
      function setupFacetWithCheckboxUnselected() {
        setupCustomFacet();
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0);
        cy.wait(RouteAlias.analytics);
        selectFacetValueAt(0);
      }

      describe('verify rendering', () => {
        before(setupFacetWithCheckboxUnselected);
        FacetAssertions.assertCheckboxDisplay(0, false);
      });

      describe('verify analytics', () => {
        beforeEach(setupFacetWithCheckboxUnselected);
        FacetAssertions.assertAnalyticLogFacetDeselect();
      });
    });

    describe('When user clicks ShowMore button', () => {
      function setupFacetWithSelectedShowMore() {
        setupCustomFacet();
        cy.wait(RouteAlias.analytics);
        selectShowMoreButton();
        cy.wait(RouteAlias.search);
      }
      describe('verify rendering', () => {
        before(setupFacetWithSelectedShowMore);
        FacetAssertions.assertFacetNumberOfValueEqual(customNumberOfValue * 2);
        FacetAssertions.assertFacetValuesSortedAlphanumerically(true);
        FacetAssertions.assertDisplayShowLessButton(true);
      });
    });
  });

  describe('Facet with custom sort-criteria options', () => {
    FacetAssertions.assertFacetSortCriteria('alphanumeric');
    FacetAssertions.assertFacetSortCriteria('occurrences');
    FacetAssertions.assertFacetSortCriteria('automatic');
    FacetAssertions.assertFacetSortCriteria('score');
  });

  describe('Facet with custom delimitingCharacter', () => {
    beforeEach(() => {
      setupFacet({attributes: 'delimiting-character=","'});
    });
    it('Should generate Facet correctly');
  });

  describe('Facet with selected value on initialization', () => {
    before(() => {
      setupIntercept();
      cy.visit(buildTestUrl(`f[${facetField}]=Cervantes`));
      injectComponent(
        `<atomic-facet field="${facetField}"></atomic-facet>`,
        true
      );
    });

    FacetAssertions.assertAnalyticLogFacetInInterfaceLoadEvent();
    FacetAssertions.assertCheckboxDisplay(0, true);
  });

  describe('Facet with field returns no result', () => {
    before(() => {
      setupFacet({field: 'author2'});
    });
    FacetAssertions.assertDisplayFacet(false, 'author2');
  });

  describe('Facet with invalid option', () => {
    describe('When field is invalid', () => {
      before(() => {
        setupFacet({field: '@test'});
      });
      FacetAssertions.assertContainsComponentError(true, '@test');
    });

    describe('When the numberOfValues prop is not in the list of numberOfValues', () => {
      before(() => {
        setupFacet({attributes: 'number-of-values=-5'});
      });
      FacetAssertions.assertContainsComponentError(true);
    });

    describe('When the numberOfValues prop is not a number ', () => {
      before(() => {
        setupFacet({attributes: 'number-of-values="here"'});
      });
      FacetAssertions.assertContainsComponentError(true);
    });

    describe('When the sortCriteria prop is not in the list of sortCriteria', () => {
      before(() => {
        setupFacet({attributes: 'sort-criteria=test'});
      });
      FacetAssertions.assertContainsComponentError(true);
    });
  });

  describe('Facet area when no first search has yet been executed', () => {
    beforeEach(() => {
      setupFacet({executeFirstSearch: false});
    });
    FacetAssertions.assertRenderPlaceHolder();
  });
});
