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
}

describe('Facet Test Suite', () => {
  function visitFacetPage(
    options: Partial<FacetOptions> = {},
    waitForInitialSearch = true
  ) {
    interceptSearch();

    cy.visit(`${Cypress.env('examplesUrl')}/s/quantic-facet`);
    configure(options);

    if (waitForInitialSearch) {
      cy.wait(InterceptAliases.Search);
    }
  }

  describe('with values', () => {
    const defaultField = 'objecttype';
    const defaultLabel = 'Type';
    const defaultNumberOfValues = 8;

    function setupWithValues() {
      visitFacetPage({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
      });
    }

    describe('verify rendering', () => {
      before(setupWithValues);

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
        setupWithValues();
        checkFirstValue(FacetSelectors);
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

      describe('when selecting a second value', () => {
        function selectLastFacetValue() {
          selectFirstFacetValue();
          cy.wait(InterceptAliases.UA.Facet.Select);

          checkLastValue(FacetSelectors);
        }

        describe('verify rendering', () => {
          before(selectLastFacetValue);

          Expect.displayClearButton(true);
          Expect.numberOfSelectedCheckboxValues(2);
          Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 2);
        });

        describe('verify analytics', () => {
          before(selectLastFacetValue);

          Expect.logFacetSelect(defaultField, 1);
        });

        describe('when selecting the "Clear" button', () => {
          function clearSelectedValues() {
            selectFirstFacetValue();
            FacetSelectors.clearButton().click();
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
      });

      describe('when searching for a value that returns results', () => {
        const query = 'a';

        function searchForValue() {
          setupWithValues();
          FacetSelectors.searchInput().type(query);
        }

        function searchForSingleValue() {
          setupWithValues();
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
            FacetSelectors.values().should('have.length', 1);
            checkFirstValue(FacetSelectors);
            cy.wait(InterceptAliases.Search);
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
            setupWithValues();
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
        setupWithValues();
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
        visitFacetPage(
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
});
