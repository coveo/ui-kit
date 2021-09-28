import {configure} from '../../../page-objects/configurator';

import {FacetSelectors} from './facet-selectors';
import {FacetExpectations as Expect} from './facet-expectations';
import {
  extractFacetValues,
  InterceptAliases,
  interceptSearch,
} from '../../../page-objects/search';
import {checkFirstValue, checkLastValue} from './facet-actions';

interface FacetOptions {
  field: string;
  label: string;
  numberOfValues: number;
  sortCriteria: string;
  noSearch: boolean;
}

describe('Facet Test Suite', () => {
  const pageUrl = 's/quantic-facet';

  const defaultField = 'objecttype';
  const defaultLabel = 'Type';
  const defaultNumberOfValues = 8;

  function visitFacetPage(options: Partial<FacetOptions> = {}) {
    interceptSearch();

    cy.visit(pageUrl);
    configure(options);
  }

  function loadFromUrlHash(
    options: Partial<FacetOptions> = {},
    urlHash: string
  ) {
    interceptSearch();

    cy.visit(`${pageUrl}#${urlHash}`);
    configure(options);
  }

  describe('with values', () => {
    const indexFacetValuesAlias = '@indexFacetValues';
    function aliasFacetValues() {
      cy.wait(InterceptAliases.Search).then((interception) => {
        const indexValues = extractFacetValues(interception.response);
        cy.wrap(indexValues).as(indexFacetValuesAlias.substring(1));
      });
    }

    function setupWithValues() {
      visitFacetPage({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
      });
      aliasFacetValues();
    }

    before(setupWithValues);

    Expect.facetValuesEqual(indexFacetValuesAlias);
    Expect.labelContains(defaultLabel);
    Expect.displayValues(true);
    Expect.numberOfSelectedCheckboxValues(0);
    Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
    Expect.displayClearButton(false);
    Expect.displayShowMoreButton(true);
    Expect.displayShowLessButton(false);
    Expect.displaySearchInput(true);

    describe('when selecting a value', () => {
      function selectFirstFacetValue() {
        setupWithValues();
        checkFirstValue(FacetSelectors);
      }

      before(selectFirstFacetValue);

      Expect.logFacetSelect(defaultField, 0);

      Expect.displayClearButton(true);
      Expect.numberOfSelectedCheckboxValues(1);
      Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);

      describe('when selecting a second value', () => {
        function selectLastFacetValue() {
          selectFirstFacetValue();
          cy.wait(InterceptAliases.UA.Facet.Select);

          checkLastValue(FacetSelectors);
        }

        before(selectLastFacetValue);

        Expect.logFacetSelect(defaultField, 1);

        Expect.displayClearButton(true);
        Expect.numberOfSelectedCheckboxValues(2);
        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 2);

        describe('when selecting the "Clear" button', () => {
          function clearSelectedValues() {
            selectFirstFacetValue();
            FacetSelectors.clearButton().click();
          }

          before(clearSelectedValues);

          Expect.logClearFacetValues(defaultField);

          Expect.displayClearButton(false);
          Expect.numberOfSelectedCheckboxValues(0);
          Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
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
        const singleValueQuery = 'account';
        FacetSelectors.searchInput().type(singleValueQuery);
        for (let i = 0; i < singleValueQuery.length; i++) {
          cy.wait(InterceptAliases.FacetSearch);
        }
      }

      before(searchForValue);

      Expect.logFacetSearch(defaultField);

      Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
      Expect.numberOfSelectedCheckboxValues(0);
      Expect.displayMoreMatchesFound(true);
      Expect.displayNoMatchesFound(false);
      Expect.moreMatchesFoundContainsQuery(query);
      Expect.displayShowMoreButton(false);
      Expect.displaySearchClearButton(true);
      Expect.highlightsResults(query);

      describe('when clearing the facet search results', () => {
        function clearSearchInput() {
          searchForValue();
          FacetSelectors.searchClearButton().click();
        }

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

      describe('when selecting a search result', () => {
        function selectSearchResult() {
          searchForSingleValue();
          checkFirstValue(FacetSelectors);
        }

        before(selectSearchResult);

        Expect.logFacetSelect(defaultField, 0);

        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
        Expect.numberOfSelectedCheckboxValues(1);
        Expect.displayMoreMatchesFound(false);
        Expect.displayNoMatchesFound(false);
        Expect.displayShowMoreButton(true);
        Expect.displaySearchInput(true);
        Expect.displaySearchClearButton(false);
      });

      describe('when searching for a value that returns a single result', () => {
        before(searchForSingleValue);

        Expect.numberOfIdleCheckboxValues(1);
        Expect.numberOfSelectedCheckboxValues(0);
        Expect.displayMoreMatchesFound(false);
        Expect.displayNoMatchesFound(false);
        Expect.displaySearchClearButton(true);
      });

      describe('when searching for a value that returns no results', () => {
        const query = 'this facet value does not exist';

        function searchForInvalidValue() {
          setupWithValues();
          FacetSelectors.searchInput().type(query);
        }

        before(searchForInvalidValue);

        Expect.numberOfIdleCheckboxValues(0);
        Expect.numberOfSelectedCheckboxValues(0);
        Expect.displayMoreMatchesFound(false);
        Expect.displayNoMatchesFound(true);
        Expect.noMatchesFoundContainsQuery(query);
        Expect.displaySearchClearButton(true);
      });
    });

    describe('show more/less values', () => {
      describe('when facet has no more values', () => {
        function showAllValues() {
          visitFacetPage({
            field: defaultField,
            label: defaultLabel,
            numberOfValues: 1000,
          });
          cy.wait(InterceptAliases.Search);
        }

        before(showAllValues);

        Expect.displayShowMoreButton(false);
        Expect.displayShowLessButton(false);
      });

      describe('when clicking show more values', () => {
        const smallNumberOfValues = 2;

        function showMoreValues() {
          visitFacetPage({
            field: defaultField,
            label: defaultLabel,
            numberOfValues: smallNumberOfValues,
          });
          cy.wait(InterceptAliases.Search);
          FacetSelectors.showMoreButton().click();
          aliasFacetValues();
        }

        before(showMoreValues);

        Expect.facetValuesEqual(indexFacetValuesAlias);
        Expect.numberOfValues(smallNumberOfValues * 2);

        describe('when clicking show more button again', () => {
          function showMoreValuesAgain() {
            showMoreValues();
            FacetSelectors.showMoreButton().click();
            aliasFacetValues();
          }

          before(showMoreValuesAgain);

          Expect.facetValuesEqual(indexFacetValuesAlias);
          Expect.numberOfValues(smallNumberOfValues * 3);

          describe('when clicking show less button', () => {
            function showLessValues() {
              showMoreValuesAgain();
              FacetSelectors.showLessButton().click();
              aliasFacetValues();
            }

            before(showLessValues);

            Expect.facetValuesEqual(indexFacetValuesAlias);
            Expect.numberOfValues(smallNumberOfValues);
          });
        });
      });
    });

    describe('when collapsing a facet', () => {
      function collapseFacet() {
        setupWithValues();
        FacetSelectors.collapseButton().click();
      }

      before(collapseFacet);

      Expect.labelContains(defaultLabel);
      Expect.displayExpandButton(true);
      Expect.displaySearchInput(false);
      Expect.numberOfIdleCheckboxValues(0);
      Expect.displayShowMoreButton(false);

      describe('when expanding a facet', () => {
        function expandFacet() {
          collapseFacet();
          FacetSelectors.expandButton().click();
        }

        before(expandFacet);

        Expect.labelContains(defaultLabel);
        Expect.displayCollapseButton(true);
        Expect.displaySearchInput(true);
        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
        Expect.displayShowMoreButton(true);
      });
    });
  });

  describe('with custom field, label, and number of results', () => {
    function setupCustomOptions() {
      visitFacetPage({
        field: 'language',
        label: 'Language',
        numberOfValues: 3,
      });
    }

    before(setupCustomOptions);

    Expect.labelContains('Language');
    Expect.facetValueContains('English');
    Expect.numberOfIdleCheckboxValues(3);
  });

  describe('when field returns no results', () => {
    before(() => {
      visitFacetPage({
        field: 'somethingthatdoesnotexist',
      });
      cy.wait(InterceptAliases.Search);
    });

    Expect.displayLabel(false);
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

  describe('with invalid sorting', () => {
    before(() => {
      visitFacetPage({
        sortCriteria: 'invalid',
      });
    });

    Expect.displayLabel(false);
  });

  describe('with no search', () => {
    function setupNoSearch() {
      visitFacetPage({
        noSearch: true,
      });
    }

    before(setupNoSearch);

    Expect.displaySearchInput(false);
  });

  describe('with a selected value in the URL', () => {
    const selectedValue = 'Account';

    function loadWithSelectedValue() {
      loadFromUrlHash(
        {
          field: defaultField,
        },
        `f[objecttype]=${selectedValue}`
      );
    }

    before(loadWithSelectedValue);

    Expect.numberOfSelectedCheckboxValues(1);
    Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
    Expect.selectedCheckboxValuesContain(selectedValue);
  });
});
