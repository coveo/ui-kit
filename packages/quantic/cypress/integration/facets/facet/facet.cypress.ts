import {configure} from '../../../page-objects/configurator';

import {FacetSelectors} from './facet-selectors';
import {FacetExpectations as Expect} from './facet-expectations';
import {
  extractFacetValues,
  InterceptAliases,
  interceptSearch,
  interceptSearchIndefinitely,
  interceptSearchWithError,
  mockNoMoreFacetValues,
} from '../../../page-objects/search';
import {FacetActions as Actions} from './facet-actions';

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
  const pageUrl = 's/quantic-facet';

  const defaultField = 'objecttype';
  const defaultLabel = 'Type';
  const defaultNumberOfValues = 8;

  const indexFacetValuesAlias = '@indexFacetValues';

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

  function aliasFacetValues() {
    cy.wait(InterceptAliases.Search).then((interception) => {
      const indexValues = extractFacetValues(interception.response);
      cy.wrap(indexValues).as(indexFacetValuesAlias.substring(1));
    });
  }

  describe('when loading', () => {
    function setupWithPauseBeforeSearch() {
      interceptSearchIndefinitely();
      cy.visit(pageUrl);
      configure({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
      });
    }

    it('should render correctly', () => {
      setupWithPauseBeforeSearch();

      Expect.displayPlaceholder(true);
    });
  });

  describe('when search returns an error', () => {
    function setupWithError() {
      interceptSearchWithError();
      cy.visit(pageUrl);
      configure({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
      });
    }

    it('should render correctly', () => {
      setupWithError();

      Expect.displayPlaceholder(false);
      Expect.displayValues(false);
      Expect.displayClearButton(false);
      Expect.displayShowMoreButton(false);
      Expect.displayShowLessButton(false);
      Expect.displaySearchInput(false);
    });
  });

  describe('with values', () => {
    function setupWithValues() {
      visitFacetPage({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
      });
    }

    function setupWithNoMoreValues() {
      mockNoMoreFacetValues(defaultField);
      cy.visit(pageUrl);
      configure({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
      });
    }

    it('should render correctly', () => {
      setupWithValues();

      Expect.displayPlaceholder(false);
      Expect.labelContains(defaultLabel);
      Expect.displayValues(true);
      Expect.numberOfSelectedCheckboxValues(0);
      Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
      Expect.displayClearButton(false);
      Expect.displayShowMoreButton(true);
      Expect.displayShowLessButton(false);
      Expect.displaySearchInput(true);
    });

    describe('with no more facet values to show', () => {
      it('should render correctly', () => {
        setupWithNoMoreValues();

        Expect.displayPlaceholder(false);
        Expect.labelContains(defaultLabel);
        Expect.displayValues(true);
        Expect.numberOfSelectedCheckboxValues(0);
        Expect.displayClearButton(false);
        Expect.displayShowMoreButton(false);
        Expect.displayShowLessButton(false);
        Expect.displaySearchInput(false);
      });
    });

    it('should verify facet values ordering', () => {
      setupWithValues();
      aliasFacetValues();

      Expect.facetValuesEqual(indexFacetValuesAlias);
    });

    describe('when selecting a value', () => {
      function selectFirstFacetValue() {
        setupWithValues();
        Actions.checkFirstValue();
      }

      function collapseFacet() {
        Actions.clickCollapseButton();
      }

      it('should render correctly', () => {
        selectFirstFacetValue();
        Expect.clearFilterContains('Clear filter');
        Expect.numberOfSelectedCheckboxValues(1);
        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
        Expect.logFacetSelect(defaultField, 0);
      });

      describe('when collapsing the facet', () => {
        before(() => {
          selectFirstFacetValue();
          collapseFacet();
        });

        it('should render correctly', () => {
          Expect.displayClearButton(true);
          Expect.clearFilterContains('Clear filter');
        });
      });

      describe('when selecting the "Clear" button', () => {
        function clearSelectedValues() {
          selectFirstFacetValue();
          Actions.clickClearFilter();
        }

        it('should render correctly', () => {
          clearSelectedValues();
          Expect.displayClearButton(false);
          Expect.numberOfSelectedCheckboxValues(0);
          Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
          Expect.logClearFacetValues(defaultField);
        });
      });

      describe('when selecting a second value', () => {
        const initialNumberOfSelectedValues = 2;
        function selectLastFacetValue() {
          selectFirstFacetValue();
          cy.wait(InterceptAliases.UA.Facet.Select);

          Actions.checkLastValue();
        }

        it('should render correctly', () => {
          selectLastFacetValue();

          Expect.clearFilterContains('Clear 2 filters');
          Expect.numberOfSelectedCheckboxValues(initialNumberOfSelectedValues);
          Expect.numberOfIdleCheckboxValues(
            defaultNumberOfValues - initialNumberOfSelectedValues
          );
          //Expect.logFacetSelect(defaultField, 1);
        });

        describe('when collapsing the facet', () => {
          before(() => {
            selectLastFacetValue();
            collapseFacet();
          });

          it('should render correctly', () => {
            Expect.displayClearButton(true);
            Expect.clearFilterContains('Clear 2 filters');
          });
        });
      });
    });

    describe('when searching for a value that returns results', () => {
      const query = 'a';

      function searchForValue() {
        setupWithValues();
        Actions.typeQueryInSearchInput(query);
      }

      function searchForSingleValue() {
        setupWithValues();
        const singleValueQuery = 'account';
        Actions.typeQueryInSearchInput(singleValueQuery);
        for (let i = 0; i < singleValueQuery.length; i++) {
          cy.wait(InterceptAliases.FacetSearch);
        }
      }

      it('should render correctly', () => {
        searchForValue();

        Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
        Expect.numberOfSelectedCheckboxValues(0);
        Expect.displayMoreMatchesFound(true);
        Expect.displayNoMatchesFound(false);
        Expect.moreMatchesFoundContainsQuery(query);
        Expect.displayShowMoreButton(false);
        Expect.displaySearchClearButton(true);
        Expect.highlightsResults(query);
        Expect.logFacetSearch(defaultField);
      });

      describe('when clearing the facet search results', () => {
        function clearSearchInput() {
          searchForValue();
          Actions.clickSearchClearButton();
        }

        it('should render correctly', () => {
          clearSearchInput();

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

      describe('when selecting a search result', () => {
        function selectSearchResult() {
          searchForSingleValue();
          Actions.checkFirstValue();
        }

        it('should render correctly', () => {
          selectSearchResult();

          Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
          Expect.numberOfSelectedCheckboxValues(1);
          Expect.displayMoreMatchesFound(false);
          Expect.displayNoMatchesFound(false);
          Expect.displayShowMoreButton(true);
          Expect.displaySearchInput(true);
          Expect.displaySearchClearButton(false);
          Expect.logFacetSelect(defaultField, 0);
        });
      });

      describe('when searching for a value that returns a single result', () => {
        it('should render correctly', () => {
          searchForSingleValue();

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
          Actions.typeQueryInSearchInput(query);
        }

        it('should render correctly', () => {
          searchForInvalidValue();

          Expect.numberOfIdleCheckboxValues(0);
          Expect.numberOfSelectedCheckboxValues(0);
          Expect.displayMoreMatchesFound(false);
          Expect.displayNoMatchesFound(true);
          Expect.noMatchesFoundContainsQuery(query);
          Expect.displaySearchClearButton(true);
        });
      });
    });

    describe('show more/less values', () => {
      describe('when facet has no more values', () => {
        it('should render correctly', () => {
          setupWithNoMoreValues();

          Expect.displayShowMoreButton(false);
          Expect.displayShowLessButton(false);
        });
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
          Actions.clickShowMoreButton();
        }

        it('should render correctly', () => {
          showMoreValues();

          Expect.numberOfValues(smallNumberOfValues * 2);
        });

        it.skip('should verify facet values ordering', () => {
          showMoreValues();
          aliasFacetValues();

          Expect.facetValuesEqual(indexFacetValuesAlias);
        });

        describe('when clicking show more button again', () => {
          function showMoreValuesAgain() {
            showMoreValues();
            cy.wait(InterceptAliases.Search);
            Actions.clickShowMoreButton();
          }

          it('should render correctly', () => {
            showMoreValuesAgain();

            Expect.numberOfValues(smallNumberOfValues * 3);
          });

          it.skip('should verify facet values ordering', () => {
            showMoreValuesAgain();
            aliasFacetValues();

            Expect.facetValuesEqual(indexFacetValuesAlias);
          });

          describe('when clicking show less button', () => {
            function showLessValues() {
              showMoreValuesAgain();
              cy.wait(InterceptAliases.Search);
              Actions.clickShowLessButton();
            }

            it('should render correctly', () => {
              showLessValues();

              Expect.numberOfValues(smallNumberOfValues);
            });

            it.skip('should verify facet values ordering', () => {
              showLessValues();
              aliasFacetValues();

              Expect.facetValuesEqual(indexFacetValuesAlias);
            });
          });
        });
      });
    });

    describe('when collapsing a facet', () => {
      function collapseFacet() {
        setupWithValues();
        Actions.clickCollapseButton();
      }

      it('should render correctly', () => {
        collapseFacet();

        Expect.labelContains(defaultLabel);
        Expect.displayExpandButton(true);
        Expect.displaySearchInput(false);
        Expect.numberOfIdleCheckboxValues(0);
        Expect.displayShowMoreButton(false);
      });

      describe('when expanding a facet', () => {
        function expandFacet() {
          collapseFacet();
          Actions.clickExpandButton();
        }

        it('should render correctly', () => {
          expandFacet();

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

    function setupWithNoMoreValues() {
      mockNoMoreFacetValues(defaultField);
      cy.visit(pageUrl);
      configure({
        field: defaultField,
        label: defaultLabel,
        numberOfValues: defaultNumberOfValues,
        displayValuesAs: 'link',
      });
    }

    it('should render correctly', () => {
      setupWithLinkValues();

      Expect.displayPlaceholder(false);
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

    describe('with no more facet values to show', () => {
      it('should render correctly', () => {
        setupWithNoMoreValues();

        Expect.displayPlaceholder(false);
        Expect.labelContains(defaultLabel);
        Expect.displayValues(true);
        Expect.displayClearButton(false);
        Expect.displayShowMoreButton(false);
        Expect.displayShowLessButton(false);
        Expect.displaySearchInput(false);
      });
    });

    describe('when selecting a value', () => {
      function selectFirstFacetValue() {
        setupWithLinkValues();
        Actions.selectFirstLinkValue();
      }

      function collapseFacet() {
        Actions.clickCollapseButton();
      }

      it('should render correctly', () => {
        selectFirstFacetValue();

        Expect.clearFilterContains('Clear filter');
        Expect.numberOfSelectedLinkValues(1);
        Expect.numberOfIdleLinkValues(defaultNumberOfValues - 1);
        Expect.logFacetSelect(defaultField, 0);
      });

      describe('when collapsing the facet', () => {
        before(() => {
          selectFirstFacetValue();
          collapseFacet();
        });

        it('should render correctly', () => {
          Expect.displayClearButton(true);
          Expect.clearFilterContains('Clear filter');
        });
      });

      describe('when selecting the "Clear" button', () => {
        function clearSelectedValues() {
          selectFirstFacetValue();
          FacetSelectors.clearFilterButton().click();
        }

        it('should render correctly', () => {
          clearSelectedValues();

          Expect.displayClearButton(false);
          Expect.numberOfSelectedLinkValues(0);
          Expect.numberOfIdleLinkValues(defaultNumberOfValues);
          Expect.logClearFacetValues(defaultField);
        });
      });

      describe('when selecting a second value', () => {
        function selectLastFacetValue() {
          selectFirstFacetValue();
          cy.wait(InterceptAliases.UA.Facet.Select);

          Actions.selectLastLinkValue();
        }

        it('should render correctly', () => {
          selectLastFacetValue();

          Expect.clearFilterContains('Clear filter');
          Expect.numberOfSelectedLinkValues(1);
          Expect.numberOfIdleLinkValues(defaultNumberOfValues - 1);
          // Expect.logFacetSelect(defaultField, 0);
        });

        describe('when collapsing the facet', () => {
          before(() => {
            selectLastFacetValue();
            collapseFacet();
          });

          it('should render correctly', () => {
            Expect.clearFilterContains('Clear filter');
          });
        });
      });
    });

    describe('when searching for a value that returns results', () => {
      const query = 'a';

      function searchForValue() {
        setupWithLinkValues();
        Actions.typeQueryInSearchInput(query);
      }

      function searchForSingleValue() {
        setupWithLinkValues();
        const singleValueQuery = 'account';
        Actions.typeQueryInSearchInput(singleValueQuery);
        for (let i = 0; i < singleValueQuery.length; i++) {
          cy.wait(InterceptAliases.FacetSearch);
        }
      }

      it('should render correctly', () => {
        searchForValue();

        Expect.numberOfIdleLinkValues(defaultNumberOfValues);
        Expect.numberOfSelectedLinkValues(0);
        Expect.displayMoreMatchesFound(true);
        Expect.displayNoMatchesFound(false);
        Expect.moreMatchesFoundContainsQuery(query);
        Expect.displayShowMoreButton(false);
        Expect.displaySearchClearButton(true);
        Expect.highlightsResults(query);
        Expect.logFacetSearch(defaultField);
      });

      describe('when clearing the facet search results', () => {
        function clearSearchInput() {
          searchForValue();
          Actions.clickSearchClearButton();
        }

        it('should render correctly', () => {
          clearSearchInput();

          Expect.numberOfIdleLinkValues(defaultNumberOfValues);
          Expect.numberOfSelectedLinkValues(0);
          Expect.displayMoreMatchesFound(false);
          Expect.displayNoMatchesFound(false);
          Expect.displayShowMoreButton(true);
          Expect.displayShowLessButton(false);
          Expect.searchInputEmpty();
          Expect.displaySearchClearButton(false);
        });
      });

      describe('when selecting a search result', () => {
        function selectSearchResult() {
          searchForSingleValue();
          Actions.selectFirstLinkValue();
        }

        it('should render correctly', () => {
          selectSearchResult();

          Expect.numberOfIdleLinkValues(defaultNumberOfValues - 1);
          Expect.numberOfSelectedLinkValues(1);
          Expect.displayMoreMatchesFound(false);
          Expect.displayNoMatchesFound(false);
          Expect.displayShowMoreButton(true);
          Expect.displaySearchInput(true);
          Expect.displaySearchClearButton(false);
          Expect.logFacetSelect(defaultField, 0);
        });

        describe('when selecting a second search result', () => {
          const secondQuery = 'Contact';
          function selectOtherSearchResult() {
            Actions.typeQueryInSearchInput(secondQuery);
            Actions.selectFirstLinkValue();
          }

          function selectASecondSearchResult() {
            selectSearchResult();
            selectOtherSearchResult();
          }

          it('should render correctly', () => {
            selectASecondSearchResult();

            Expect.numberOfIdleLinkValues(defaultNumberOfValues - 1);
            Expect.numberOfSelectedLinkValues(1);
            Expect.selectedValuesContain(secondQuery);
            Expect.displayMoreMatchesFound(false);
            Expect.displayNoMatchesFound(false);
            Expect.displayShowMoreButton(true);
            Expect.displaySearchInput(true);
            Expect.displaySearchClearButton(false);
            Expect.logFacetSelect(defaultField, 0);
          });
        });
      });

      describe('when searching for a value that returns a single result', () => {
        it('should render correctly', () => {
          searchForSingleValue();

          Expect.numberOfIdleLinkValues(1);
          Expect.numberOfSelectedLinkValues(0);
          Expect.displayMoreMatchesFound(false);
          Expect.displayNoMatchesFound(false);
          Expect.displaySearchClearButton(true);
        });
      });

      describe('when searching for a value that returns no results', () => {
        const query = 'this facet value does not exist';

        function searchForInvalidValue() {
          setupWithLinkValues();
          Actions.typeQueryInSearchInput(query);
        }

        it('should render correctly', () => {
          searchForInvalidValue();

          Expect.numberOfIdleLinkValues(0);
          Expect.numberOfSelectedLinkValues(0);
          Expect.displayMoreMatchesFound(false);
          Expect.displayNoMatchesFound(true);
          Expect.noMatchesFoundContainsQuery(query);
          Expect.displaySearchClearButton(true);
        });
      });
    });

    describe('show more/less values', () => {
      describe('when facet has no more values', () => {
        it('should render correctly', () => {
          setupWithNoMoreValues();

          Expect.displayShowMoreButton(false);
          Expect.displayShowLessButton(false);
        });
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
        }

        it('should render correctly', () => {
          showMoreValues();

          Expect.numberOfValues(smallNumberOfValues * 2);
        });

        it.skip('verify facet values ordering', () => {
          showMoreValues();
          aliasFacetValues();

          Expect.facetValuesEqual(indexFacetValuesAlias);
        });

        describe('when clicking show more button again', () => {
          function showMoreValuesAgain() {
            showMoreValues();
            Actions.clickShowMoreButton();
          }

          it('should render correctly', () => {
            showMoreValuesAgain();

            Expect.numberOfValues(smallNumberOfValues * 3);
          });

          it.skip('verify facet values ordering', () => {
            showMoreValuesAgain();
            aliasFacetValues();

            Expect.facetValuesEqual(indexFacetValuesAlias);
          });

          describe('when clicking show less button', () => {
            function showLessValues() {
              showMoreValuesAgain();
              cy.wait(InterceptAliases.Search);
              Actions.clickShowLessButton();
            }

            it('should render correctly', () => {
              showLessValues();

              Expect.numberOfValues(smallNumberOfValues);
            });

            it.skip('verify facet values ordering', () => {
              showLessValues();
              aliasFacetValues();

              Expect.facetValuesEqual(indexFacetValuesAlias);
            });
          });
        });
      });
    });

    describe('when collapsing a facet', () => {
      function collapseFacet() {
        setupWithLinkValues();
        Actions.clickCollapseButton();
      }

      it('should render correctly', () => {
        collapseFacet();

        Expect.labelContains(defaultLabel);
        Expect.displayExpandButton(true);
        Expect.displaySearchInput(false);
        Expect.numberOfIdleLinkValues(0);
        Expect.displayShowMoreButton(false);
      });

      describe('when expanding a facet', () => {
        function expandFacet() {
          collapseFacet();
          Actions.clickExpandButton();
        }

        it('should render correctly', () => {
          expandFacet();

          Expect.labelContains(defaultLabel);
          Expect.displayCollapseButton(true);
          Expect.displaySearchInput(true);
          Expect.numberOfIdleLinkValues(defaultNumberOfValues);
          Expect.displayShowMoreButton(true);
        });
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

    it('should render correctly', () => {
      setupCustomOptions();

      Expect.labelContains('Language');
      Expect.facetValueContains('English');
      Expect.numberOfIdleCheckboxValues(3);
    });
  });

  describe('when field returns no results', () => {
    before(() => {
      visitFacetPage({
        field: 'somethingthatdoesnotexist',
      });
      cy.wait(InterceptAliases.Search);
    });

    it('should render correctly', () => {
      Expect.displayLabel(false);
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

  describe('with invalid sorting', () => {
    before(() => {
      visitFacetPage({
        sortCriteria: 'invalid',
      });
    });
    it('should render correctly', () => {
      Expect.displayLabel(false);
    });
  });

  describe('with no search', () => {
    function setupNoSearch() {
      visitFacetPage({
        noSearch: true,
      });
    }

    it('should render correctly', () => {
      setupNoSearch();

      Expect.displaySearchInput(false);
      Expect.numberOfIdleCheckboxValues(defaultNumberOfValues);
      Expect.numberOfSelectedCheckboxValues(0);
    });
  });

  describe('with is collapsed', () => {
    function setupIsCollapsed() {
      visitFacetPage({
        isCollapsed: true,
      });
    }

    it('should render correctly', () => {
      setupIsCollapsed();

      Expect.labelContains(defaultLabel);
      Expect.displayExpandButton(true);
      Expect.displaySearchInput(false);
      Expect.numberOfIdleCheckboxValues(0);
      Expect.displayShowMoreButton(false);
    });
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

    it('should render correctly', () => {
      loadWithSelectedValue();

      Expect.numberOfSelectedCheckboxValues(1);
      Expect.numberOfIdleCheckboxValues(defaultNumberOfValues - 1);
      Expect.selectedValuesContain(selectedValue);
    });
  });
});
