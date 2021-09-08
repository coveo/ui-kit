import {configure} from '../../../page-objects/configurator';

import {FacetSelectors} from './facet-selectors';
import * as Expectations from '../facet-common-expectations';
import * as FacetExpectations from './facet-expectations';
import {setupSearchAlias} from '../../../page-objects/search';
import {checkFirstValue, checkLastValue} from './facet-actions';

interface FacetOptions {
  field: string;
  label: string;
  numberOfValues: number;
  sortCriteria: string;
  noSearch: boolean;
}

describe('Facet Test Suite', () => {
  function visitFacetPage(options: Partial<FacetOptions> = {}) {
    cy.visit(`${Cypress.env('examplesUrl')}/s/quantic-facet`);
    configure(options);
  }

  describe('with values', () => {
    const defaultNumberOfValues = 8;

    function setupWithValues() {
      visitFacetPage({
        field: 'objecttype',
        label: 'Type',
        numberOfValues: defaultNumberOfValues,
      });
    }

    describe('verify rendering', () => {
      before(setupWithValues);

      Expectations.expectLabelContains(FacetSelectors, 'Type');
      Expectations.expectDisplayValues(FacetSelectors, true);
      Expectations.expectNumberOfSelectedCheckboxValues(FacetSelectors, 0);
      Expectations.expectNumberOfIdleCheckboxValues(
        FacetSelectors,
        defaultNumberOfValues
      );
      Expectations.expectDisplayClearButton(FacetSelectors, false);
      Expectations.expectDisplayShowMoreButton(FacetSelectors, true);
      Expectations.expectDisplayShowLessButton(FacetSelectors, false);
      Expectations.expectDisplaySearchInput(FacetSelectors, true);
    });

    describe('when selecting a value', () => {
      function selectFirstFacetValue() {
        setupWithValues();
        checkFirstValue(FacetSelectors);
      }

      describe('verify rendering', () => {
        before(selectFirstFacetValue);

        Expectations.expectDisplayClearButton(FacetSelectors, true);
        Expectations.expectNumberOfSelectedCheckboxValues(FacetSelectors, 1);
        Expectations.expectNumberOfIdleCheckboxValues(
          FacetSelectors,
          defaultNumberOfValues - 1
        );
      });

      describe('verify analytics', () => {
        // check analytics event
      });

      describe('when selecting a second value', () => {
        function selectLastFacetValue() {
          selectFirstFacetValue();
          checkLastValue(FacetSelectors);
        }

        describe('verify rendering', () => {
          before(selectLastFacetValue);

          Expectations.expectDisplayClearButton(FacetSelectors, true);
          Expectations.expectNumberOfSelectedCheckboxValues(FacetSelectors, 2);
          Expectations.expectNumberOfIdleCheckboxValues(
            FacetSelectors,
            defaultNumberOfValues - 2
          );
        });

        describe('verify analytics', () => {
          // check analytics event
        });

        describe('when selecting the "Clear" button', () => {
          function clearSelectedValues() {
            selectFirstFacetValue();
            FacetSelectors.clearButton().click();
          }

          describe('verify rendering', () => {
            before(clearSelectedValues);

            Expectations.expectDisplayClearButton(FacetSelectors, false);
            Expectations.expectNumberOfSelectedCheckboxValues(
              FacetSelectors,
              0
            );
            Expectations.expectNumberOfIdleCheckboxValues(
              FacetSelectors,
              defaultNumberOfValues
            );
          });

          describe('verify analytics', () => {
            // check analytics event
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

          Expectations.expectNumberOfIdleCheckboxValues(
            FacetSelectors,
            defaultNumberOfValues
          );
          Expectations.expectNumberOfSelectedCheckboxValues(FacetSelectors, 0);
          Expectations.expectDisplayMoreMatchesFound(FacetSelectors, true);
          Expectations.expectDisplayNoMatchesFound(FacetSelectors, false);
          Expectations.expectMoreMatchesFoundContainsQuery(
            FacetSelectors,
            query
          );
          Expectations.expectDisplayShowMoreButton(FacetSelectors, false);
          Expectations.expectDisplaySearchClearButton(FacetSelectors, true);
          Expectations.expectHighlightsResults(FacetSelectors, query);
        });

        describe('when clearing the facet search results', () => {
          function clearSearchInput() {
            searchForValue();
            FacetSelectors.searchClearButton().click();
          }

          describe('verify rendering', () => {
            before(clearSearchInput);

            Expectations.expectNumberOfIdleCheckboxValues(
              FacetSelectors,
              defaultNumberOfValues
            );
            Expectations.expectNumberOfSelectedCheckboxValues(
              FacetSelectors,
              0
            );
            Expectations.expectDisplayMoreMatchesFound(FacetSelectors, false);
            Expectations.expectDisplayNoMatchesFound(FacetSelectors, false);
            Expectations.expectDisplayShowMoreButton(FacetSelectors, true);
            Expectations.expectDisplayShowLessButton(FacetSelectors, false);
            Expectations.expectSearchInputEmpty(FacetSelectors);
            Expectations.expectDisplaySearchClearButton(FacetSelectors, false);
          });
        });

        describe('verify analytics', () => {
          // check analytics event
        });

        describe('when selecting a search result', () => {
          function selectSearchResult() {
            searchForSingleValue();
            checkFirstValue(FacetSelectors);
          }

          describe('verify rendering', () => {
            before(selectSearchResult);

            Expectations.expectNumberOfIdleCheckboxValues(
              FacetSelectors,
              defaultNumberOfValues - 1
            );
            Expectations.expectNumberOfSelectedCheckboxValues(
              FacetSelectors,
              1
            );
            Expectations.expectDisplayMoreMatchesFound(FacetSelectors, false);
            Expectations.expectDisplayNoMatchesFound(FacetSelectors, false);
            Expectations.expectDisplayShowMoreButton(FacetSelectors, true);
            Expectations.expectDisplaySearchInput(FacetSelectors, true);
            Expectations.expectDisplaySearchClearButton(FacetSelectors, false);
          });

          describe('verify analytics', () => {
            // check analytics event
          });
        });

        describe('when searching for a value that returns a single result', () => {
          describe('verify rendering', () => {
            before(searchForSingleValue);

            Expectations.expectNumberOfIdleCheckboxValues(FacetSelectors, 1);
            Expectations.expectNumberOfSelectedCheckboxValues(
              FacetSelectors,
              0
            );
            Expectations.expectDisplayMoreMatchesFound(FacetSelectors, false);
            Expectations.expectDisplayNoMatchesFound(FacetSelectors, false);
            Expectations.expectDisplaySearchClearButton(FacetSelectors, true);
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

            Expectations.expectNumberOfIdleCheckboxValues(FacetSelectors, 0);
            Expectations.expectNumberOfSelectedCheckboxValues(
              FacetSelectors,
              0
            );
            Expectations.expectDisplayMoreMatchesFound(FacetSelectors, false);
            Expectations.expectDisplayNoMatchesFound(FacetSelectors, true);
            Expectations.expectNoMatchesFoundContainsQuery(
              FacetSelectors,
              query
            );
            Expectations.expectDisplaySearchClearButton(FacetSelectors, true);
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

        Expectations.expectLabelContains(FacetSelectors, 'Type');
        Expectations.expectDisplayExpandButton(FacetSelectors, true);
        Expectations.expectDisplaySearchInput(FacetSelectors, false);
        Expectations.expectNumberOfIdleCheckboxValues(FacetSelectors, 0);
        Expectations.expectDisplayShowMoreButton(FacetSelectors, false);
      });

      describe('when expanding a facet', () => {
        function expandFacet() {
          collapseFacet();
          FacetSelectors.expandButton().click();
        }

        describe('verify rendering', () => {
          before(expandFacet);

          Expectations.expectLabelContains(FacetSelectors, 'Type');
          Expectations.expectDisplayCollapseButton(FacetSelectors, true);
          Expectations.expectDisplaySearchInput(FacetSelectors, true);
          Expectations.expectNumberOfIdleCheckboxValues(
            FacetSelectors,
            defaultNumberOfValues
          );
          Expectations.expectDisplayShowMoreButton(FacetSelectors, true);
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

      Expectations.expectLabelContains(FacetSelectors, 'Language');
      FacetExpectations.expectFacetValueContains(FacetSelectors, 'English');
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

      Expectations.expectNumberOfIdleCheckboxValues(FacetSelectors, 3);
    });
  });

  describe('with custom sorting', () => {
    ['automatic', 'score', 'alphanumeric', 'occurrences'].forEach((sorting) => {
      it(`should use "${sorting}" sorting in the facet request`, () => {
        setupSearchAlias();
        visitFacetPage({
          sortCriteria: sorting,
        });
        cy.wait('@search').then((interception) => {
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

      Expectations.expectDisplaySearchInput(FacetSelectors, false);
    });
  });
});
