import {configure} from '../../../page-objects/configurator';

import {FacetSelectors} from './facet-selectors';
import {FacetExpectations as Expect} from './facet-expectations';
import {InterceptAliases, interceptSearch} from '../../../page-objects/search';
import {checkFirstValue, checkLastValue} from './facet-actions';

interface FacetOptions {
  field: string;
  label: string;
  numberOfValues: number;
  sortCriteria: string;
  noSearch: boolean;
  isCollapsed: boolean;
  displayValuesAs: string;
}

describe('Facet Test Suite', () => {
  const defaultField = 'objecttype';
  const defaultLabel = 'Type';
  const defaultNumberOfValues = 8;

  function visitFacetPage(options: Partial<FacetOptions> = {}) {
    interceptSearch();

    cy.visit(`${Cypress.env('examplesUrl')}/s/quantic-facet`);
    configure(options);
  }

  describe('with checkbox values', () => {
    function setupWithCheckboxValues() {
      visitFacetPage({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
      });
    }

    describe('verify rendering', () => {
      before(setupWithCheckboxValues);

      Expect.labelContains(defaultLabel);
      Expect.displayValues(true);
      Expect.numberOfSelectedCheckboxValues(0);
      Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
      Expect.displayClearButton(false);
      Expect.displayShowMoreButton(true);
      Expect.displayShowLessButton(false);
      Expect.displaySearchInput(true);
    });

    describe('when selecting a value', () => {
      function selectFirstFacetValue() {
        setupWithCheckboxValues();
        checkFirstValue(FacetSelectors);
      }

      function collapseFacet() {
        FacetSelectors.collapseButton().click();
      }

      describe('verify rendering', () => {
        before(selectFirstFacetValue);

        Expect.displayClearButton(true);
        Expect.numberOfSelectedCheckboxValues(1);
        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
      });

      describe('verify analytics', () => {
        before(selectFirstFacetValue);

        Expect.logFacetSelect(defaultField, 0);
      });

      describe('when collapsing the facet', () => {
        before(() => {
          selectFirstFacetValue();
          collapseFacet();
        });

        describe('verify rendering', () => {
          Expect.displayClearButton(true);
        });
      });

      describe('when selecting the "Clear" button', () => {
        function clearSelectedValues() {
          selectFirstFacetValue();
          FacetSelectors.clearFilterButton().click();
        }

        describe('verify rendering', () => {
          before(clearSelectedValues);

          Expect.displayClearButton(false);
          Expect.numberOfSelectedCheckboxValues(0);
          Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
        });

        describe('verify analytics', () => {
          before(clearSelectedValues);

          Expect.logClearFacetValues(defaultField);
        });
      });

      describe('when selecting a second value', () => {
        const initialNumberOfValues = 2;
        function selectLastFacetValue() {
          selectFirstFacetValue();
          cy.wait(InterceptAliases.UA.Facet.Select);

          checkLastValue(FacetSelectors);
        }

        describe('verify rendering', () => {
          before(selectLastFacetValue);

          Expect.displayClearXFiltersButton(initialNumberOfValues);
          Expect.numberOfSelectedCheckboxValues(initialNumberOfValues);
          Expect.numberOfIdleCheckboxValues(
            defaultNumberOfValues - initialNumberOfValues
          );
        });

        describe('verify analytics', () => {
          before(selectLastFacetValue);

          Expect.logFacetSelect(defaultField, 1);
        });

        describe('when collapsing the facet', () => {
          before(() => {
            selectLastFacetValue();
            collapseFacet();
          });

          describe('verify rendering', () => {
            Expect.displayClearXFiltersButton(initialNumberOfValues);
          });
        });
      });

      describe('when searching for a value that returns results', () => {
        const query = 'a';

        function searchForValue() {
          setupWithCheckboxValues();
          FacetSelectors.searchInput().type(query);
        }

        function searchForSingleValue() {
          setupWithCheckboxValues();
          FacetSelectors.valueLabel()
            .first()
            .then((element) => {
              const facetValue = element.text();
              FacetSelectors.searchInput().type(facetValue);
            });
        }

        describe('verify rendering', () => {
          before(searchForValue);

          Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
          Expect.numberOfSelectedCheckboxValues(0);
          Expect.displayMoreMatchesFound(true);
          Expect.displayNoMatchesFound(false);
          Expect.moreMatchesFoundContainsQuery(query);
          Expect.displayShowMoreButton(false);
          Expect.displaySearchClearButton(true);
          Expect.highlightsResults(query);
        });

        describe('when clearing the facet search results', () => {
          function clearSearchInput() {
            searchForValue();
            FacetSelectors.searchClearButton().click();
          }

          describe('verify rendering', () => {
            before(clearSearchInput);

            Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
            Expect.numberOfSelectedCheckboxValues(0);
            Expect.displayMoreMatchesFound(false);
            Expect.displayNoMatchesFound(false);
            Expect.displayShowMoreButton(true);
            Expect.displayShowLessButton(false);
            Expect.searchInputEmpty();
            Expect.displaySearchClearButton(false);
          });
        });

        describe('verify analytics', () => {
          before(searchForValue);

          Expect.logFacetSearch(defaultField);
        });

        describe('when selecting a search result', () => {
          function selectSearchResult() {
            searchForSingleValue();
            checkFirstValue(FacetSelectors);
          }

          describe('verify rendering', () => {
            before(selectSearchResult);

            Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
            Expect.numberOfSelectedCheckboxValues(1);
            Expect.displayMoreMatchesFound(false);
            Expect.displayNoMatchesFound(false);
            Expect.displayShowMoreButton(true);
            Expect.displaySearchInput(true);
            Expect.displaySearchClearButton(false);
          });

          describe('verify analytics', () => {
            before(selectSearchResult);

            Expect.logFacetSelect(defaultField, 0);
          });
        });

        describe('when searching for a value that returns a single result', () => {
          describe('verify rendering', () => {
            before(searchForSingleValue);

            Expect.numberOfIdleCheckboxValues(1);
            Expect.numberOfSelectedCheckboxValues(0);
            Expect.displayMoreMatchesFound(false);
            Expect.displayNoMatchesFound(false);
            Expect.displaySearchClearButton(true);
          });
        });

        describe('when searching for a value that returns no results', () => {
          const query = 'this facet value does not exist';

          function searchForInvalidValue() {
            setupWithCheckboxValues();
            FacetSelectors.searchInput().type(query);
          }

          describe('verify rendering', () => {
            before(searchForInvalidValue);

            Expect.numberOfIdleCheckboxValues(0);
            Expect.numberOfSelectedCheckboxValues(0);
            Expect.displayMoreMatchesFound(false);
            Expect.displayNoMatchesFound(true);
            Expect.noMatchesFoundContainsQuery(query);
            Expect.displaySearchClearButton(true);
          });
        });
      });
    });

    describe('when collapsing a facet', () => {
      function collapseFacet() {
        setupWithCheckboxValues();
        FacetSelectors.collapseButton().click();
      }

      describe('verify rendering', () => {
        before(collapseFacet);

        Expect.labelContains(defaultLabel);
        Expect.displayExpandButton(true);
        Expect.displaySearchInput(false);
        Expect.numberOfIdleCheckboxValues(0);
        Expect.displayShowMoreButton(false);
      });

      describe('when expanding a facet', () => {
        function expandFacet() {
          collapseFacet();
          FacetSelectors.expandButton().click();
        }

        describe('verify rendering', () => {
          before(expandFacet);

          Expect.labelContains(defaultLabel);
          Expect.displayCollapseButton(true);
          Expect.displaySearchInput(true);
          Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
          Expect.displayShowMoreButton(true);
        });
      });
    });
  });

  describe('with link values', () => {
    function setupWithLinkValues() {
      visitFacetPage({
        field: defaultField,
        label: defaultLabel,
        displayValuesAs: 'link',
      });
    }

    describe('verify rendering', () => {
      before(setupWithLinkValues);

      Expect.labelContains(defaultLabel);
      Expect.displayValues(true);
      Expect.hasCheckbox(false);
      Expect.numberOfSelectedLinkValues(0);
      Expect.numberOfIdleLinkValues(defaultNumberOfValues);
      Expect.displayClearButton(false);
      Expect.displayShowMoreButton(true);
      Expect.displayShowLessButton(false);
      Expect.displaySearchInput(true);
    });
  });

  describe('with custom field and label', () => {
    function setupCustomFieldAndLabel() {
      visitFacetPage({
        field: 'language',
        label: 'Language',
      });
    }

    describe('verify rendering', () => {
      before(setupCustomFieldAndLabel);

      Expect.labelContains('Language');
      Expect.facetValueContains('English');
    });
  });

  describe('with custom number of results', () => {
    function setupCustomNumberOfResults() {
      visitFacetPage({
        numberOfValues: 3,
      });
    }

    describe('verify rendering', () => {
      before(setupCustomNumberOfResults);

      Expect.numberOfIdleCheckboxValues(3);
    });
  });

  describe('with custom sorting', () => {
    ['automatic', 'score', 'alphanumeric', 'occurrences'].forEach((sorting) => {
      it(`should use "${sorting}" sorting in the facet request`, () => {
        visitFacetPage({
          sortCriteria: sorting,
        });
        cy.wait(InterceptAliases.Search).then((interception) => {
          const facetRequest = interception.request.body.facets[0];
          expect(facetRequest.sortCriteria).to.eq(sorting);
        });
      });
    });
  });

  describe('with no search', () => {
    function setupNoSearch() {
      visitFacetPage({
        noSearch: true,
      });
    }

    describe('verify rendering', () => {
      before(setupNoSearch);

      Expect.displaySearchInput(false);
    });
  });

  describe('with is collapsed', () => {
    function setupIsCollapsed() {
      visitFacetPage({
        isCollapsed: true,
      });
    }

    describe('verify rendering', () => {
      before(setupIsCollapsed);

      Expect.labelContains(defaultLabel);
      Expect.displayExpandButton(true);
      Expect.displaySearchInput(false);
      Expect.numberOfIdleCheckboxValues(0);
      Expect.displayShowMoreButton(false);
    });
  });
});
